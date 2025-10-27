// CAMBIO: [2025-10-26] - Creado OrdenCompraService
// CAMBIO: [2025-10-26] - Refactor: Eliminada lógica de Puntos
// Se elimina toda la lógica de descuento y gasto de puntos.
// La nueva lógica indica que los puntos se ganan, no se gastan.
// La ganancia de puntos se implementará en un servicio
// de 'completarOrden' (post-pago).

import { EstadoEvento } from "@/enums/EstadoEvento";
import { EstadoOrden } from "@/enums/EstadoOrden";
import { DetalleOrden } from "@/models/DetalleOrden";
import { OrdenCompra } from "@/models/OrdenCompra";
import { Zona } from "@/models/Zona";
import { EventoRepository } from "@/repositories/EventoRepository";
import { OrdenCompraRepository } from "@/repositories/OrdenCompraRepository";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import { ZonaRepository } from "@/repositories/ZonaRepository";
import { CustomError } from "@/types/CustomError";
import { StatusCodes } from "http-status-codes";
import { CrearOrdenDto } from "../dto/orden/crear-orden.dto";
import { Cliente } from "@/models/Cliente";
import { Rol } from "@/enums/Rol";

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
   */
  async crearOrden(dto: CrearOrdenDto, clienteId: number): Promise<OrdenCompra> {
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

      // 3. Validar Puntos (LÓGICA ELIMINADA)
      // Ya no se valida dto.puntosUtilizados

      // 4. Validar zonas y stock
      const zonaIds = dto.items.map(item => item.zonaId);
      const zonas = await this.zonaRepo.buscarMultiplesPorIds(zonaIds);

      if (zonas.length !== zonaIds.length) {
        throw new CustomError("Una o más zonas seleccionadas son inválidas.", StatusCodes.NOT_FOUND);
      }

      let totalPagado = 0;
      let cantidadEntradas = 0;
      const detallesAGuardar: DetalleOrden[] = [];
      const zonasAActualizar: Zona[] = [];

      for (const item of dto.items) {
        const zona = zonas.find(z => z.id === item.zonaId);
        if (!zona) {
          throw new CustomError(`Zona con ID ${item.zonaId} no encontrada.`, StatusCodes.NOT_FOUND);
        }
        
        const cantidad = item.dnis.length;
        if (cantidad === 0) continue; 

        // ¡Validación de Stock!
        if ((zona.cantidadComprada + cantidad) > zona.capacidad) {
          const disponibles = zona.capacidad - zona.cantidadComprada;
          throw new CustomError(
            `Stock insuficiente para la zona "${zona.nombre}". Solicitadas: ${cantidad}, Disponibles: ${disponibles}`,
            StatusCodes.CONFLICT
          );
        }

        zona.cantidadComprada += cantidad;
        zonasAActualizar.push(zona);

        // Calcular totales
        const subtotal = zona.costo * cantidad;
        totalPagado += subtotal; // 'totalBruto' ahora es 'totalPagado'
        cantidadEntradas += cantidad;

        const detalle = new DetalleOrden();
        detalle.zona = zona;
        detalle.cantidad = cantidad;
        detalle.precioUnitario = zona.costo;
        detalle.subtotal = subtotal;
        detalle.dnis = item.dnis; 
        detallesAGuardar.push(detalle);
      }

      // 5. Calcular descuento (LÓGICA ELIMINADA)
      // Ya no hay descuentoPorPuntos ni totalFinalPagado

      // 6. Crear la orden principal
      const nuevaOrden = new OrdenCompra();
      nuevaOrden.cliente = cliente;
      nuevaOrden.evento = evento;
      nuevaOrden.estado = EstadoOrden.PENDIENTE; 
      nuevaOrden.cantidadEntradas = cantidadEntradas;
      nuevaOrden.totalPagado = totalPagado; // Se guarda el total directo

      // 7. Guardar todo en una transacción
      const ordenGuardada = await this.ordenCompraRepo.guardarOrdenConTransaccion(
        nuevaOrden,
        detallesAGuardar,
        zonasAActualizar
        // 'cliente' ya no se pasa a la transacción
      );

      // NOTA: La ganancia de puntos (totalPagado * 100)
      // debe implementarse en un servicio 'completarOrden'
      // que se llame DESPUÉS del pago exitoso.

      return ordenGuardada;

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al crear la orden de compra: " + (error as Error).message, 
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
}

export const ordenCompraService = OrdenCompraService.getInstance();