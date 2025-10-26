import { AppDataSource } from "@/database/data-source";
import { EstadoEvento } from "@/enums/EstadoEvento";
import { Evento } from "@/models/Evento";
import { Brackets, Repository } from "typeorm";

// Definimos una interfaz para los filtros que esperamos de la URL
// Vienen como string porque req.query siempre es string
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

  private constructor() {
    this.repository = AppDataSource.getRepository(Evento);
  }

  public static getInstance(): EventoRepository {
    if (!EventoRepository.instance) {
      EventoRepository.instance = new EventoRepository();
    }
    return EventoRepository.instance;
  }

  /**
   * Busca eventos "PUBLICADOS" aplicando filtros dinámicos.
   */
  async listarEventosFiltrados(filtros: IFiltrosEvento): Promise<Evento[]> {
    
    // 1. Iniciar el QueryBuilder
    const qb = this.repository.createQueryBuilder("evento");

    // 2. Unir (Join) con Artista y Categoría para poder filtrar por ellos
    // Usamos leftJoinAndSelect para que también traiga esta info en la respuesta
    qb.leftJoinAndSelect("evento.artista", "artista")
      .leftJoinAndSelect("artista.categoria", "categoria");

    // 3. Filtro base: Solo eventos PUBLICADOS
    qb.where("evento.estado = :estado", { estado: EstadoEvento.PUBLICADO });

    // 4. Aplicar filtros dinámicos (solo si existen)

    // --- Filtros de Ubicación (Exact Match) ---
    if (filtros.departamento) {
      qb.andWhere("evento.departamento = :depto", { depto: filtros.departamento });
    }
    if (filtros.provincia) {
      qb.andWhere("evento.provincia = :prov", { prov: filtros.provincia });
    }
    if (filtros.distrito) {
      qb.andWhere("evento.distrito = :dist", { dist: filtros.distrito });
    }

    // --- Filtro de Artista ---
    if (filtros.artistaId) {
      qb.andWhere("artista.id = :artistaId", { artistaId: Number(filtros.artistaId) });
    }

    // --- Filtro de Categoría ---
    if (filtros.categoriaId) {
      qb.andWhere("categoria.id = :categoriaId", { categoriaId: Number(filtros.categoriaId) });
    }

    // --- Filtro de Fechas ---
    if (filtros.fechaInicio) {
      qb.andWhere("evento.fechaEvento >= :fechaInicio", { fechaInicio: filtros.fechaInicio });
    }
    if (filtros.fechaFin) {
      // Asumimos que la fechaFin es un día, sumamos 1 día para incluirlo completo
      const fechaFinMasUnDia = new Date(filtros.fechaFin);
      fechaFinMasUnDia.setDate(fechaFinMasUnDia.getDate() + 1);
      qb.andWhere("evento.fechaEvento < :fechaFin", { fechaFin: fechaFinMasUnDia });
    }

    // --- Filtro de Precio (Sub-consulta) ---
    // Esto busca eventos donde "EXISTA" al menos una zona que cumpla el criterio
    if (filtros.precioMin || filtros.precioMax) {
      qb.andWhere(new Brackets(sqb => {
        sqb.where("EXISTS (SELECT 1 FROM zona z WHERE z.eventoId = evento.id " +
          (filtros.precioMin ? "AND z.costo >= :precioMin " : "") +
          (filtros.precioMax ? "AND z.costo <= :precioMax " : "") +
        ")", { 
          precioMin: filtros.precioMin ? Number(filtros.precioMin) : undefined,
          precioMax: filtros.precioMax ? Number(filtros.precioMax) : undefined,
        });
      }));
    }

    // 5. Ordenar por fecha de evento (opcional, pero recomendado)
    qb.orderBy("evento.fechaEvento", "ASC");

    // 6. Obtener los resultados
    return await qb.getMany();
  }

  /**
   * Busca un evento por su ID
   */
  async buscarPorId(id: number): Promise<Evento | null> {
    return await this.repository.findOne({
        where: { id },
        relations: ["zonas", "artista", "calificaciones"] 
    });
  }

  /**
   * Crea un nuevo evento en la base de datos.
   */
  async crearEvento(data: Partial<Evento>): Promise<Evento> {
    const nuevoEvento = this.repository.create(data);
    return await this.repository.save(nuevoEvento);
  }
}

export const eventoRepository = EventoRepository.getInstance();