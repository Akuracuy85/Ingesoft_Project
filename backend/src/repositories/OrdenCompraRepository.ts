import { AppDataSource } from "../database/data-source";
import { DetalleOrden } from "../models/DetalleOrden";
import { OrdenCompra } from "../models/OrdenCompra";
import { Zona } from "../models/Zona";
import { Repository, Between } from "typeorm";
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
   * Lista órdenes (compras) aplicando filtros opcionales.
   * Soporta filtros por cliente, evento, estado y rango de fechas (createdAt).
   */
  async listarCompras(filtros: {
    clienteId?: number;
    eventoId?: number;
    estado?: EstadoOrden;
    fechaInicio?: Date;
    fechaFin?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<OrdenCompra[]> {
    const qb = this.repository.createQueryBuilder('orden')
      .leftJoinAndSelect('orden.cliente', 'cliente')
      .leftJoinAndSelect('orden.evento', 'evento')
      .leftJoinAndSelect('orden.detalles', 'detalles')
      .leftJoinAndSelect('detalles.zona', 'zona')
      .orderBy('orden.createdAt', 'DESC');

    if (filtros.clienteId) {
      qb.andWhere('cliente.id = :clienteId', { clienteId: filtros.clienteId });
    }

    if (filtros.eventoId) {
      qb.andWhere('evento.id = :eventoId', { eventoId: filtros.eventoId });
    }

    if (filtros.estado) {
      qb.andWhere('orden.estado = :estado', { estado: filtros.estado });
    }

    if (filtros.fechaInicio && filtros.fechaFin) {
      qb.andWhere('orden.createdAt BETWEEN :inicio AND :fin', {
        inicio: filtros.fechaInicio,
        fin: filtros.fechaFin,
      });
    } else if (filtros.fechaInicio) {
      qb.andWhere('orden.createdAt >= :inicio', { inicio: filtros.fechaInicio });
    } else if (filtros.fechaFin) {
      qb.andWhere('orden.createdAt <= :fin', { fin: filtros.fechaFin });
    }

    if (typeof filtros.limit === 'number') {
      qb.limit(filtros.limit);
    }
    if (typeof filtros.offset === 'number') {
      qb.offset(filtros.offset);
    }

    return await qb.getMany();
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