// src/services/OrdenCompraService.ts

import { EstadoEvento } from "../enums/EstadoEvento";
import { EstadoOrden } from "../enums/EstadoOrden";
import { DetalleOrden } from "../models/DetalleOrden";
import { OrdenCompra } from "../models/OrdenCompra";

import { Zona } from "../models/Zona";
import { EventoRepository } from "../repositories/EventoRepository";
import { OrdenCompraRepository } from "../repositories/OrdenCompraRepository";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { ZonaRepository } from "../repositories/ZonaRepository";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";
import { CrearOrdenDto } from "../dto/orden/crear-orden.dto";
import { Cliente } from "../models/Cliente";
import { Rol } from "../enums/Rol";
import { CalcularPrecioDto } from '../dto/orden/calcular-precio.dto';
import { PerfilRepository } from "../repositories/PerfilRepository";
// Definición de lo que devuelve el servicio
interface OrdenCreationResult {
  orden: OrdenCompra;
  paymentUrl: string;
}

export class OrdenCompraService {
  private static instance: OrdenCompraService;
  private ordenCompraRepo: OrdenCompraRepository;
  private usuarioRepo: UsuarioRepository;
  private eventoRepo: EventoRepository;
  private zonaRepo: ZonaRepository;
  private perfilRepo: PerfilRepository;


  private constructor() {
    this.ordenCompraRepo = OrdenCompraRepository.getInstance();
    this.usuarioRepo = UsuarioRepository.getInstance();
    this.eventoRepo = EventoRepository.getInstance();
    this.zonaRepo = ZonaRepository.getInstance();
    this.perfilRepo = PerfilRepository.getInstance();
  }

  public static getInstance(): OrdenCompraService {
    if (!OrdenCompraService.instance) {
      OrdenCompraService.instance = new OrdenCompraService();
    }
    return OrdenCompraService.instance;
  }

  /**
   * Lógica principal para crear una nueva orden de compra.
   * @returns {OrdenCreationResult} - La orden guardada y la URL de pago (simulada o real).
   */
  async crearOrden(dto: CrearOrdenDto, clienteId: number): Promise<OrdenCreationResult> {
    try {
      // 1. Validar que el cliente exista
      const cliente = (await this.usuarioRepo.buscarPorId(clienteId)) as Cliente;
      if (!cliente || cliente.rol !== Rol.CLIENTE) {
        throw new CustomError("Cliente no encontrado.", StatusCodes.NOT_FOUND);
      }

      // 2. Validar que el evento exista y esté publicado
      const evento = await this.eventoRepo.buscarPorId(dto.eventoId);
      if (!evento) throw new CustomError("Evento no encontrado.", StatusCodes.NOT_FOUND);
      if (evento.estado !== EstadoEvento.PUBLICADO) {
        throw new CustomError("Este evento no está disponible para la venta.", StatusCodes.BAD_REQUEST);
      }

      // 3. Validar zonas y stock
      const zonaIds = dto.items.map(item => item.zonaId);
      const zonas = await this.zonaRepo.buscarMultiplesPorIds(zonaIds);

      if (zonas.length !== zonaIds.length) {
        throw new CustomError("Una o más zonas seleccionadas son inválidas.", StatusCodes.NOT_FOUND);
      }

      let totalPagado = 0;
      let cantidadEntradas = 0;
      const detallesAGuardar: DetalleOrden[] = [];
      const zonasAActualizar: Zona[] = [];
      const now = new Date(); // Usamos la fecha actual para la lógica de preventa

      for (const item of dto.items) {
        const zona = zonas.find(z => z.id === item.zonaId);
        if (!zona) {
          throw new CustomError(`Zona con ID ${item.zonaId} no encontrada.`, StatusCodes.NOT_FOUND);
        }

        const cantidad = item.dnis.length;
        if (cantidad === 0) continue;

        // ✅ CORRECCIÓN: Lógica de Preventa vs. Tarifa Normal
        let precioUnitario: number;

        if (zona.tarifaPreventa && new Date(zona.tarifaPreventa.fechaFin) > now) {
          precioUnitario = zona.tarifaPreventa.precio;
        } else {
          precioUnitario = zona.tarifaNormal.precio;
        }

        // ¡Validación de Stock!
        if ((zona.cantidadComprada + cantidad) > zona.capacidad) {
          const disponibles = zona.capacidad - zona.cantidadComprada;
          throw new CustomError(
            `Stock insuficiente para la zona "${zona.nombre}". Solicitadas: ${cantidad}, Disponibles: ${disponibles}`,
            StatusCodes.CONFLICT
          );
        }

        // Aumentar cantidad comprada (Reservar stock)
        zona.cantidadComprada += cantidad;
        zonasAActualizar.push(zona);

        // Calcular totales
        const subtotal = precioUnitario * cantidad;
        totalPagado += subtotal;
        cantidadEntradas += cantidad;

        const detalle = new DetalleOrden();
        detalle.zona = zona;
        detalle.cantidad = cantidad;
        detalle.precioUnitario = precioUnitario; // Guardar el precio aplicado
        detalle.subtotal = subtotal;
        detalle.dnis = item.dnis;
        detallesAGuardar.push(detalle);
      }

      // 4. Crear la orden principal
      const nuevaOrden = new OrdenCompra();
      nuevaOrden.cliente = cliente;
      nuevaOrden.evento = evento;
      nuevaOrden.estado = EstadoOrden.PENDIENTE; // La orden está pendiente de pago
      nuevaOrden.cantidadEntradas = cantidadEntradas;
      nuevaOrden.totalPagado = totalPagado;

      // 5. Guardar todo en una transacción (Reservar tickets y crear orden)
      const ordenGuardada = await this.ordenCompraRepo.guardarOrdenConTransaccion(
        nuevaOrden,
        detallesAGuardar,
        zonasAActualizar
      );

      // 6. ✅ SIMULACIÓN DE PASARELA DE PAGO
      const paymentUrl = /*`${process.env.PAYMENT_SIMULATION_URL}/checkout/${ordenGuardada.id}?amount=${totalPagado}`*/ '/eventos';

      // Devolver la orden guardada y la URL
      return {
        orden: ordenGuardada,
        paymentUrl: paymentUrl // URL para redirigir al frontend
      };

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al crear la orden de compra: " + (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async calcularTotal(dto: CalcularPrecioDto): Promise<number> {
    try {
      // 1. Validar que el evento exista y cargar sus zonas/tarifas
      // Usamos el método que ya trae las zonas y tarifas
      const evento = await this.eventoRepo.buscarPorIdParaCompra(dto.eventoId);
      if (!evento) {
        throw new CustomError("Evento no encontrado.", StatusCodes.NOT_FOUND);
      }
      if (evento.estado !== EstadoEvento.PUBLICADO) {
        throw new CustomError("Este evento no está disponible para la venta.", StatusCodes.BAD_REQUEST);
      }

      let totalCentimos = 0;
      const now = new Date();

      // 2. Iterar sobre los items enviados por el frontend
      for (const item of dto.items) {
        const zona = evento.zonas.find(z => z.id === item.zonaId);

        // Validar que la zona pertenezca al evento
        if (!zona) {
          throw new CustomError(`La zona con ID ${item.zonaId} no pertenece a este evento.`, StatusCodes.BAD_REQUEST);
        }

        // 3. Aplicar la MISMA lógica de precios que en 'crearOrden'
        let precioUnitario: number;

        if (zona.tarifaPreventa && new Date(zona.tarifaPreventa.fechaFin) > now) {
          precioUnitario = zona.tarifaPreventa.precio;
        } else if (zona.tarifaNormal) {
          precioUnitario = zona.tarifaNormal.precio;
        } else {
          // Si la zona no tiene precio (error de configuración del evento)
          throw new CustomError(`La zona "${zona.nombre}" no tiene un precio definido.`, StatusCodes.CONFLICT);
        }

        // 4. Sumar al total
        totalCentimos += (precioUnitario * item.cantidad);
      }

      // 5. Devolver el total
      return totalCentimos;

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al calcular el total: " + (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async obtenerOrden(id: number, clienteId: number): Promise<OrdenCompra> {
    try {
      const orden = await this.ordenCompraRepo.buscarPorId(id);
      if (!orden) {
        throw new CustomError("Orden no encontrada.", StatusCodes.NOT_FOUND);
      }
      if (orden.cliente.id !== clienteId) {
        throw new CustomError("No autorizado para ver esta orden.", StatusCodes.FORBIDDEN);
      }
      return orden;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al obtener la orden", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  // 🎯 2. FUNCIÓN PARA LISTAR "ENTRADAS" (Detalles de Orden)
  /**
   * Devuelve todos los *detalles* de las órdenes (qué zonas y cuántas)
   * que un cliente ha comprado para un evento.
   */
  async listarDetallesPorClienteYEvento(clienteId: number, eventoId: number): Promise<DetalleOrden[]> {
    try {
      const ordenes = await this.ordenCompraRepo.findByClienteAndEvento(clienteId, eventoId);

      const todosLosDetalles = ordenes.flatMap(orden => orden.detalles);

      return todosLosDetalles;

    } catch (error) {
      // 🎯 AÑADE ESTA LÍNEA
      console.error("DEBUG: Error en listarDetallesPorClienteYEvento:", error);

      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al listar los detalles de las órdenes.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // 🎯 3. FUNCIÓN PARA CONTAR ENTRADAS
  /**
   * Devuelve la *cantidad total* de entradas que un cliente
   * ha comprado para un evento (sumando todas sus órdenes).
   */
  async contarEntradasPorClienteYEvento(clienteId: number, eventoId: number): Promise<number> {
    try {
      const ordenes = await this.ordenCompraRepo.findByClienteAndEvento(clienteId, eventoId);

      // Sumamos la 'cantidadEntradas' de cada orden encontrada
      const totalEntradas = ordenes.reduce((total, orden) => {
        return total + orden.cantidadEntradas;
      }, 0); // 0 es el valor inicial

      return totalEntradas;

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al contar las entradas.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Devuelve órdenes (compras) aplicando filtros opcionales.
   * Los parámetros de fecha pueden pasarse como string (ISO) o Date.
   */
  async listarCompras(filtros: {
    clienteId?: number;
    eventoId?: number;
    estado?: EstadoOrden;
    fechaInicio?: string | Date;
    fechaFin?: string | Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<OrdenCompra[]> {
    try {
      const parsed: {
        clienteId?: number;
        eventoId?: number;
        estado?: EstadoOrden;
        fechaInicio?: Date;
        fechaFin?: Date;
        limit?: number;
        offset?: number;
      } = {};

      if (filtros.clienteId) parsed.clienteId = filtros.clienteId;
      if (filtros.eventoId) parsed.eventoId = filtros.eventoId;
      if (filtros.estado) parsed.estado = filtros.estado;
      if (filtros.limit !== undefined) parsed.limit = filtros.limit;
      if (filtros.offset !== undefined) parsed.offset = filtros.offset;

      if (filtros.fechaInicio) {
        parsed.fechaInicio = filtros.fechaInicio instanceof Date ? filtros.fechaInicio : new Date(filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        parsed.fechaFin = filtros.fechaFin instanceof Date ? filtros.fechaFin : new Date(filtros.fechaFin);
      }

      return await this.ordenCompraRepo.listarCompras(parsed);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al listar las compras: " + (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  /**
   * Confirma una orden pendiente, la marca como 'COMPLETADA' y
   * asigna los puntos de la compra al cliente.
   * @param ordenId - El ID de la orden a confirmar.
   * @param clienteId - El ID del cliente (del token) para verificar propiedad.
   */
  private async validarOrdenParaConfirmacion(ordenId: number, clienteId: number): Promise<{ orden: OrdenCompra; cliente: Cliente }> {
    const orden = await this.ordenCompraRepo.buscarPorId(ordenId);
    if (!orden) {
      throw new CustomError("Orden no encontrada.", StatusCodes.NOT_FOUND);
    }
    if (orden.cliente.id !== clienteId) {
      throw new CustomError("No autorizado para confirmar esta orden.", StatusCodes.FORBIDDEN);
    }
    if (orden.estado !== EstadoOrden.PENDIENTE) {
      throw new CustomError("Esta orden no puede ser confirmada (ya está completada o cancelada).", StatusCodes.BAD_REQUEST);
    }
    const cliente = await this.usuarioRepo.buscarPorId(clienteId) as Cliente;
    if (!cliente || cliente.rol !== Rol.CLIENTE) {
      throw new CustomError("Cliente no encontrado.", StatusCodes.NOT_FOUND);
    }
    const puntosCorrectos = await this.perfilRepo.buscarSoloPuntos(clienteId);
    cliente.puntos = puntosCorrectos ? puntosCorrectos.puntos : 0;
    return { orden, cliente };
  }

  // 🎯 1. MÉTODO RENOMBRADO Y MODIFICADO (Confirmar Standar - Gana 10%)
  /**
   * Confirma una orden (Estándar), la marca como 'COMPLETADA' y
   * asigna el 10% del total pagado como puntos al cliente.
   */
  async confirmarStandarYAsignarPuntos(ordenId: number, clienteId: number): Promise<OrdenCompra> {
    try {
      const { orden, cliente } = await this.validarOrdenParaConfirmacion(ordenId, clienteId);

      // --- Lógica de Negocio (Estándar) ---
      // 1. Cambiar estado
      orden.estado = EstadoOrden.COMPLETADA;

      // 2. Sumar 10% de puntos (redondeado al céntimo/punto más cercano)
      const puntosGanados = Math.round(orden.totalPagado * 0.10);
      cliente.puntos = (cliente.puntos || 0) + puntosGanados;
      // --- Fin Lógica ---

      // 3. Ejecutar la transacción (el método del repo no cambia)
      await this.ordenCompraRepo.confirmarOrdenYActualizarPuntos(orden, cliente);

      return orden;

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al confirmar la orden estándar: " + (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 🎯 2. NUEVO MÉTODO (Confirmar Preventa - Pierde 30%)
  /**
   * Confirma una orden (Preventa), la marca como 'COMPLETADA' y
   * resta el 30% del total pagado de los puntos del cliente.
   */
  async confirmarPreventaYRestarPuntos(ordenId: number, clienteId: number): Promise<OrdenCompra> {
    try {
      const { orden, cliente } = await this.validarOrdenParaConfirmacion(ordenId, clienteId);

      // --- Lógica de Negocio (Preventa) ---
      // 1. Cambiar estado
      orden.estado = EstadoOrden.COMPLETADA;

      // 2. Calcular puntos a restar
      const puntosARestar = Math.round(orden.totalPagado * 0.30);
      const puntosActuales = cliente.puntos || 0;

      // 3. VALIDACIÓN IMPORTANTE: Verificar si tiene puntos suficientes
      if (puntosActuales < puntosARestar) {
        throw new CustomError(
          `Puntos insuficientes para confirmar. Puntos requeridos: ${puntosARestar}, Puntos actuales: ${puntosActuales}.`,
          StatusCodes.CONFLICT // 409 Conflict es bueno para esto
        );
      }

      // 4. Restar puntos
      cliente.puntos = puntosActuales - puntosARestar;
      // --- Fin Lógica ---

      // 5. Ejecutar la transacción
      await this.ordenCompraRepo.confirmarOrdenYActualizarPuntos(orden, cliente);

      return orden;

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al confirmar la orden de preventa: " + (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}


export const ordenCompraService = OrdenCompraService.getInstance();


