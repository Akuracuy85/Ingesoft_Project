// CAMBIO: [2025-10-26] - Creado OrdenCompraRepository
// CAMBIO: [2025-10-26] - Refactor: Simplificada la transacción
// Se elimina 'clienteActualizado' de la firma de 'guardarOrdenConTransaccion'
// ya que los puntos no se actualizan en este paso.
import { AppDataSource } from "@/database/data-source";
import { DetalleOrden } from "@/models/DetalleOrden";
import { OrdenCompra } from "@/models/OrdenCompra";
import { Zona } from "@/models/Zona";
import { Repository } from "typeorm";
// Importamos Cliente solo para la firma de la transacción (aunque ahora se elimina)
// Para evitar errores si se usa en otro lado, lo dejamos importado.
import { Cliente } from "@/models/Cliente";

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
}

export const ordenCompraRepository = OrdenCompraRepository.getInstance();