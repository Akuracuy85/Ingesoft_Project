import { AppDataSource } from "@/database/data-source";
import { EstadoEvento } from "@/enums/EstadoEvento";
import { Documento } from "@/models/Documento";
import { Evento } from "@/models/Evento";
import { Zona } from "@/models/Zona";
import { Brackets, Repository } from "typeorm";

export type EventoBasico = Pick<Evento, "nombre" | "fechaEvento" | "estado">;

// Filtros para las búsquedas públicas de eventos publicados.
export interface IFiltrosEvento {
  precioMin?: string;
  precioMax?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  categoriaId?: string;
  artistaId?: string;
  fechaInicio?: string;
  fechaFin?: string;
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
        zonas: true,
        documentosRespaldo: true,
        terminosUso: true,
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

    qb.leftJoinAndSelect("evento.artista", "artista").leftJoinAndSelect(
      "artista.categoria",
      "categoria"
    );

    qb.where("evento.estado = :estado", { estado: EstadoEvento.PUBLICADO });

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

    if (filtros.artistaId) {
      qb.andWhere("artista.id = :artistaId", {
        artistaId: Number(filtros.artistaId),
      });
    }

    if (filtros.categoriaId) {
      qb.andWhere("categoria.id = :categoriaId", {
        categoriaId: Number(filtros.categoriaId),
      });
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

    if (filtros.precioMin || filtros.precioMax) {
      qb.andWhere(
        new Brackets((sqb) => {
          sqb.where(
            "EXISTS (SELECT 1 FROM zona z WHERE z.eventoId = evento.id " +
              (filtros.precioMin ? "AND z.costo >= :precioMin " : "") +
              (filtros.precioMax ? "AND z.costo <= :precioMax " : "") +
              ")",
            {
              precioMin: filtros.precioMin
                ? Number(filtros.precioMin)
                : undefined,
              precioMax: filtros.precioMax
                ? Number(filtros.precioMax)
                : undefined,
            }
          );
        })
      );
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
      },
    });
  }
}

export const eventoRepository = EventoRepository.getInstance();
