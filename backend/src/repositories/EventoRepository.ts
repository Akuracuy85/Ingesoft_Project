import { AppDataSource } from "../database/data-source";
import { EstadoEvento } from "../enums/EstadoEvento";
import { Documento } from "../models/Documento";
import { Evento } from "../models/Evento";
import { Zona } from "../models/Zona";
import { Acción } from "../models/Acción";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";
import { Brackets, Repository } from "typeorm";

export type EventoBasico = Pick<Evento, "nombre" | "fechaEvento" | "estado">;

// Filtros para las búsquedas públicas de eventos publicados.
export interface IFiltrosEvento {
  precioMin?: number;
  precioMax?: number;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  categoriaIds?: number[];
  artistaIds?: number[];
  fechaInicio?: string;
  fechaFin?: string;
}
export interface IUbicacionFiltro {
  departamento: string;
  provincia: string;
  distrito: string;
}
export class EventoRepository {
  private static instance: EventoRepository;
  private repository: Repository<Evento>;
  private documentoRepository: Repository<Documento>;
  private zonaRepository: Repository<Zona>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Evento);
    this.documentoRepository = AppDataSource.getRepository(Documento);
    this.zonaRepository = AppDataSource.getRepository(Zona);
  }

  public static getInstance(): EventoRepository {
    if (!EventoRepository.instance) {
      EventoRepository.instance = new EventoRepository();
    }
    return EventoRepository.instance;
  }

  async obtenerDatosBasicosPorOrganizador(
    organizadorId: number
  ): Promise<EventoBasico[]> {
    return await this.repository.find({
      select: {
        nombre: true,
        fechaEvento: true,
        estado: true,
      },
      where: {
        organizador: { id: organizadorId },
      },
      order: { fechaEvento: "ASC" },
    });
  }

  async crearEvento(data: Partial<Evento>): Promise<Evento> {
    const evento = this.repository.create(data);
    return await this.repository.save(evento);
  }

  // Obtiene todos los eventos del organizador con sus relaciones para listados completos.
  async obtenerEventosDetalladosPorOrganizador(
    organizadorId: number
  ): Promise<Evento[]> {
    return await this.repository.find({
      where: { organizador: { id: organizadorId } },
      relations: {
        organizador: true,
        zonas: {
          tarifaNormal: true,
          tarifaPreventa: true,
        },
        documentosRespaldo: true,
        terminosUso: true,
        artista: true,
        cola: true,
        calificaciones: true,
        entradas: true,
      },
      order: { fechaEvento: "ASC" },
    });
  }

  // Recupera el evento con relaciones mínimas necesarias para procesos de edición.
  async obtenerEventoDetalle(id: number): Promise<Evento | null> {
    return await this.repository.findOne({
      where: { id },
      relations: {
        organizador: true,
        zonas: {
          tarifaNormal: true,
          tarifaPreventa: true,
        },
        documentosRespaldo: true,
        terminosUso: true,
        artista: true,
      },
    });
  }

  async guardarEvento(evento: Evento): Promise<Evento> {
    return await this.repository.save(evento);
  }

  async guardarZonas(zonas: Zona[]): Promise<Zona[]> {
    return await this.zonaRepository.save(zonas);
  }

  async eliminarZonasPorIds(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await this.zonaRepository.delete(ids);
  }

  async guardarDocumentos(documentos: Documento[]): Promise<Documento[]> {
    return await this.documentoRepository.save(documentos);
  }

  async eliminarDocumentosPorIds(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await this.documentoRepository.delete(ids);
  }

  async eliminarDocumentoPorId(id: number): Promise<void> {
    await this.documentoRepository.delete(id);
  }

  async guardarDocumento(documento: Documento): Promise<Documento> {
    return await this.documentoRepository.save(documento);
  }

  /**
   * Busca eventos publicados aplicando filtros dinámicos.
   */
  async listarEventosFiltrados(filtros: IFiltrosEvento): Promise<Evento[]> {
    const qb = this.repository.createQueryBuilder("evento");
    qb.distinct(true);
    qb.andWhere("evento.fechaEvento >= :fechaActual", { fechaActual: new Date() });
    qb.andWhere("evento.estado = :estado", { estado: EstadoEvento.PUBLICADO });
    qb.leftJoinAndSelect("evento.artista", "artista").leftJoinAndSelect(
      "artista.categoria",
      "categoria"
    );
    // qb.leftJoin("evento.zonas", "zona");
    // qb.leftJoin("zona.tarifaNormal", "tarifaNormal");
    // qb.leftJoin("zona.tarifaPreventa", "tarifaPreventa");


    qb.leftJoinAndSelect("evento.zonas", "zona");
    qb.leftJoinAndSelect("zona.tarifaNormal", "tarifaNormal");
    qb.leftJoinAndSelect("zona.tarifaPreventa", "tarifaPreventa");


    if (filtros.departamento) {
      qb.andWhere("evento.departamento = :depto", {
        depto: filtros.departamento,
      });
    }
    if (filtros.provincia) {
      qb.andWhere("evento.provincia = :prov", { prov: filtros.provincia });
    }
    if (filtros.distrito) {
      qb.andWhere("evento.distrito = :dist", { dist: filtros.distrito });
    }

    /*if (filtros.artistaId) {
      qb.andWhere("artista.id = :artistaId", {
        artistaId: Number(filtros.artistaId),
      });
    }*/


    if (filtros.artistaIds && filtros.artistaIds.length > 0) {
      qb.andWhere("artista.id IN (:...artistaIds)", { artistaIds: filtros.artistaIds });
    }

    // 🛑 LÓGICA DE IDs (MÁS SIMPLE)
    if (filtros.categoriaIds && filtros.categoriaIds.length > 0) {
      qb.andWhere("categoria.id IN (:...categoriaIds)", { categoriaIds: filtros.categoriaIds });
    }

    if (filtros.fechaInicio) {
      qb.andWhere("evento.fechaEvento >= :fechaInicio", {
        fechaInicio: filtros.fechaInicio,
      });
    }
    if (filtros.fechaFin) {
      const fechaFin = new Date(filtros.fechaFin);
      fechaFin.setDate(fechaFin.getDate() + 1);
      qb.andWhere("evento.fechaEvento < :fechaFin", { fechaFin });
    }

    const precioMin = filtros.precioMin;
    const precioMax = filtros.precioMax;
    const aplicarMin = typeof precioMin === "number" && !Number.isNaN(precioMin);
    const aplicarMax = typeof precioMax === "number" && !Number.isNaN(precioMax);

    if (aplicarMin || aplicarMax) {
      qb.andWhere(
        new Brackets((precioQb) => {
          if (aplicarMin && aplicarMax) {
            precioQb.where(
              "(tarifaNormal.id IS NOT NULL AND tarifaNormal.precio BETWEEN :precioMin AND :precioMax) OR " +
              "(tarifaPreventa.id IS NOT NULL AND tarifaPreventa.precio BETWEEN :precioMin AND :precioMax)"
            );
          } else if (aplicarMin) {
            precioQb.where(
              "(tarifaNormal.id IS NOT NULL AND tarifaNormal.precio >= :precioMin) OR " +
              "(tarifaPreventa.id IS NOT NULL AND tarifaPreventa.precio >= :precioMin)"
            );
          } else if (aplicarMax) {
            precioQb.where(
              "(tarifaNormal.id IS NOT NULL AND tarifaNormal.precio <= :precioMax) OR " +
              "(tarifaPreventa.id IS NOT NULL AND tarifaPreventa.precio <= :precioMax)"
            );
          }
        })
      );

      if (aplicarMin) {
        qb.setParameter("precioMin", precioMin as number);
      }
      if (aplicarMax) {
        qb.setParameter("precioMax", precioMax as number);
      }
    }

    qb.orderBy("evento.fechaEvento", "ASC");

    return await qb.getMany();
  }

  async buscarPorId(id: number): Promise<Evento | null> {
    return await this.repository.findOne({
      where: { id },
      relations: {
        zonas: {
          tarifaNormal: true,
          tarifaPreventa: true,
        },
        artista: true,
        calificaciones: true,
        cola: true,
      },
    });
  }

  /**
   * Cambia el estado de un evento y crea una acción asociada en la misma transacción.
   * Esto garantiza que ambos cambios se apliquen de forma atómica.
   */
  async cambiarEstadoEventoConAccion(
    eventoId: number,
    nuevoEstado: EstadoEvento,
    accionData: Partial<Acción>
  ): Promise<Evento> {
    try {
      return await AppDataSource.manager.transaction(async (manager) => {
        const eventoRepo = manager.getRepository(Evento);
        const accionRepo = manager.getRepository(Acción);

        const evento = await eventoRepo.findOne({ where: { id: eventoId } });
        if (!evento) {
          throw new CustomError("Evento no encontrado", StatusCodes.NOT_FOUND);
        }

        evento.estado = nuevoEstado;
        if (nuevoEstado === EstadoEvento.PUBLICADO) {
          evento.fechaPublicacion = new Date();
        }

        const eventoGuardado = await eventoRepo.save(evento);

        const nuevaAccion = accionRepo.create(accionData);
        await accionRepo.save(nuevaAccion);

        return eventoGuardado;
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al actualizar el estado del evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
     * @description Busca un evento por ID cargando las relaciones mínimas necesarias
     * para el proceso de mapeo DTO de la vista de compra (Zonas y Artista).
     */
  async buscarPorIdParaCompra(id: number): Promise<Evento | null> {
    return await this.repository.findOne({
      where: { id },
      relations: {
        zonas: {
          tarifaNormal: true,
          tarifaPreventa: true
        }, // Necesario para 'zonasDisponibles'
        artista: true, // Necesario para mapear 'artistName'
        cola: true,
      },
    });
  }
  async obtenerUbicaciones(): Promise<IUbicacionFiltro[]> {
    const qb = this.repository.createQueryBuilder("evento");

    qb.select("evento.departamento", "departamento")
      .addSelect("evento.provincia", "provincia")
      .addSelect("evento.distrito", "distrito")
      // Solo mostrar ubicaciones de eventos que están publicados
      .where("evento.estado = :estado", { estado: EstadoEvento.PUBLICADO })
      .distinct(true) // Obtenemos combinaciones únicas
      .orderBy("departamento", "ASC")
      .addOrderBy("provincia", "ASC")
      .addOrderBy("distrito", "ASC");

    // .getRawMany() devuelve objetos planos
    return await qb.getRawMany<IUbicacionFiltro>();
  }

  async obtenerEmailDeAsistentesAlEvento(eventoId: number): Promise<string[]> {
    const qb = this.repository.createQueryBuilder("evento");
    qb.leftJoin("evento.entradas", "entrada")
      .leftJoin("entrada.ordenCompra", "ordenCompra")
      .leftJoin("ordenCompra.cliente", "cliente")
      .select("cliente.email", "email")
      .where("evento.id = :eventoId", { eventoId })
      .andWhere("ordenCompra.estado = :estado", { estado: "COMPLETADA" })
      .distinct(true);
    const resultados = await qb.getRawMany<{ email: string }>();
    return resultados.map((r) => r.email);
  }

  async obtenerTodosLosEventos(): Promise<Evento[]> {
    return await this.repository.find({
      relations: {
        organizador: true, // Para saber quién es el organizador
        artista: true,  // Para ver el artista principal
        zonas: true
      },
      order: {
        fechaEvento: "DESC", // O "ASC" si prefieres ver los más próximos primero
      },
    });
  }

}

export const eventoRepository = EventoRepository.getInstance();
