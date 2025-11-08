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
  

  private constructor() {
    this.ordenCompraRepo = OrdenCompraRepository.getInstance();
    this.usuarioRepo = UsuarioRepository.getInstance();
    this.eventoRepo = EventoRepository.getInstance();
    this.zonaRepo = ZonaRepository.getInstance();
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
}

export const ordenCompraService = OrdenCompraService.getInstance();