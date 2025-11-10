// CAMBIO: [2025-10-26] - Creado OrdenCompraRepository
// CAMBIO: [2025-10-26] - Refactor: Simplificada la transacción
// Se elimina 'clienteActualizado' de la firma de 'guardarOrdenConTransaccion'
// ya que los puntos no se actualizan en este paso.
import { AppDataSource } from "../database/data-source";
import { DetalleOrden } from "../models/DetalleOrden";
import { OrdenCompra } from "../models/OrdenCompra";
import { Zona } from "../models/Zona";
import { Repository } from "typeorm";
// Importamos Cliente solo para la firma de la transacción (aunque ahora se elimina)
// Para evitar errores si se usa en otro lado, lo dejamos importado.
import { Cliente } from "../models/Cliente";
import { Usuario } from "../models/Usuario";

import { EstadoOrden } from "../enums/EstadoOrden";

export class OrdenCompraRepository {
  private static instance: OrdenCompraRepository;
  private repository: Repository<OrdenCompra>;

  private constructor() {
    this.repository = AppDataSource.getRepository(OrdenCompra);
  }

  public static getInstance(): OrdenCompraRepository {
    if (!OrdenCompraRepository.instance) {
      OrdenCompraRepository.instance = new OrdenCompraRepository();
    }
    return OrdenCompraRepository.instance;
  }
  async findByClienteAndEvento(clienteId: number, eventoId: number): Promise<OrdenCompra[]> {
    return await this.repository.find({
      where: {
        cliente: { id: clienteId },
        evento: { id: eventoId },
        
        // IMPORTANTE: Solo contar/listar entradas de órdenes pagadas
        // Cambia esto si también quieres contar órdenes 'PENDIENTE'
        estado: EstadoOrden.COMPLETADA 
      },
      // Cargamos los detalles (zonas, dnis, etc.)
      relations: ["detalles", "detalles.zona"]
    });
  }
  /**
   * Guarda la orden, sus detalles y actualiza el stock de zonas
   * dentro de una transacción de base de datos.
   */
  async guardarOrdenConTransaccion(
    orden: OrdenCompra,
    detalles: DetalleOrden[],
    zonasActualizadas: Zona[]
    // 'clienteActualizado' se eliminó de aquí
  ): Promise<OrdenCompra> {
    
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      // 1. Guardar la orden principal
      const ordenGuardada = await transactionalEntityManager.save(orden);

      // 2. Asignar la nueva orden a los detalles y guardarlos
      for (const detalle of detalles) {
        detalle.orden = ordenGuardada;
        await transactionalEntityManager.save(detalle);
      }

      // 3. Actualizar la cantidadComprada en las zonas
      await transactionalEntityManager.save(zonasActualizadas);

      return ordenGuardada;
    });
  }

  async buscarPorId(id: number): Promise<OrdenCompra | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["cliente", "evento", "detalles", "detalles.zona"]
    });
  }
  /**
   * Actualiza el estado de una orden a 'COMPLETADA' y suma los puntos
   * al cliente correspondiente, todo dentro de una transacción.
   * @param orden - La entidad OrdenCompra (ya modificada con estado='COMPLETADA')
   * @param cliente - La entidad Cliente (ya modificada con los nuevos puntos)
   */
  async confirmarOrdenYActualizarPuntos(orden: OrdenCompra, cliente: Usuario): Promise<void> {
    
    // Usamos el gestor de transacciones de AppDataSource
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      // 1. Guardar la orden (que ahora tiene estado 'COMPLETADA')
      await transactionalEntityManager.save(orden);
      
      // 2. Guardar el cliente (que ahora tiene los puntos actualizados)
      await transactionalEntityManager.save(cliente);
    });
  }
}

export const ordenCompraRepository = OrdenCompraRepository.getInstance();