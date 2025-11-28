import { AppDataSource } from "../database/data-source";
import { EstadoEvento } from "../enums/EstadoEvento";
import { Documento } from "../models/Documento";
import { Evento } from "../models/Evento";
import { Zona } from "../models/Zona";
import { Acción } from "../models/Acción";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";
import { Brackets, In, Repository } from "typeorm";

export interface IFiltrosEventoAdmin {
  fechaInicio?: Date;
  fechaFin?: Date;
  nombreEvento?: string;      // Búsqueda por nombre del evento
  nombreOrganizador?: string; // Búsqueda por nombre/apellido del organizador
}

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

function mapRawEvento(raw: any): Evento {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    fechaEvento: raw.fechaEvento,
    lugar: raw.lugar,
    departamento: raw.departamento,
    provincia: raw.provincia,
    distrito: raw.distrito,
    imagenBanner: raw.imagenBanner,
    imagenLugar: raw.imagenLugar,
    mimeType: raw.mimeType,
    artista: {
      id: raw.artista_id,
      nombre: raw.artista_nombre,
      categoria: raw.categoria_id
        ? { id: raw.categoria_id, nombre: raw.categoria_nombre }
        : null
    },
    zonas: []
  } as any;
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
    // 1️⃣ Obtener SOLO IDs de eventos (consulta súper liviana)
    const idQb = this.repository.createQueryBuilder("evento")
      .select("evento.id")
      .distinct(true)
      .where("evento.estado = :estado", { estado: EstadoEvento.PUBLICADO });

    if (filtros.departamento) idQb.andWhere("evento.departamento = :d", { d: filtros.departamento });
    if (filtros.provincia) idQb.andWhere("evento.provincia = :p", { p: filtros.provincia });
    if (filtros.distrito) idQb.andWhere("evento.distrito = :dist", { dist: filtros.distrito });

    if (filtros.categoriaIds && filtros.categoriaIds.length > 0) {
      // Necesitamos hacer JOIN con Artista y luego con Categoria para filtrar
      idQb.innerJoin("evento.artista", "filtroArtista")
        .innerJoin("filtroArtista.categoria", "filtroCategoria")
        .andWhere("filtroCategoria.id IN (:...catIds)", { catIds: filtros.categoriaIds });
    }

    // Filtro por Artistas (Ya que estaba en tu interfaz, es útil tenerlo)
    if (filtros.artistaIds && filtros.artistaIds.length > 0) {
      
      if (!filtros.categoriaIds || filtros.categoriaIds.length === 0) {
        idQb.innerJoin("evento.artista", "filtroArtistaDirecto");
        idQb.andWhere("filtroArtistaDirecto.id IN (:...artIds)", { artIds: filtros.artistaIds });
      } else {
        // Si ya filtramos por categoría, el join a 'filtroArtista' ya existe arriba
        idQb.andWhere("filtroArtista.id IN (:...artIds)", { artIds: filtros.artistaIds });
      }
    }

    if (filtros.fechaInicio)
      idQb.andWhere("evento.fechaEvento >= :fi", { fi: filtros.fechaInicio });

    if (filtros.fechaFin) {
      const fechaFin = new Date(filtros.fechaFin);
      fechaFin.setDate(fechaFin.getDate() + 1);
      idQb.andWhere("evento.fechaEvento < :ff", { ff: fechaFin });
    }
    const idsRaw = await idQb.getRawMany();
    const ids = idsRaw.map(r => r.evento_id);

    if (!ids.length) return [];

    // 2️⃣ Cargar eventos ya con artista y categoría
    const eventosRaw = await this.repository.createQueryBuilder("e")
      .select([
        "e.id AS id",
        "e.nombre AS nombre",
        "e.descripcion AS descripcion",
        "e.fechaEvento AS fechaEvento",
        "e.lugar AS lugar",
        "e.departamento AS departamento",
        "e.provincia AS provincia",
        "e.distrito AS distrito",
        "e.imagenBanner AS imagenBanner",

        "a.id AS artista_id",
        "a.nombre AS artista_nombre",

        "c.id AS categoria_id",
        "c.nombre AS categoria_nombre"
      ])
      .leftJoin("e.artista", "a")
      .leftJoin("a.categoria", "c")
      .where("e.id IN (:...ids)", { ids })
      .orderBy("e.fechaEvento", "ASC")
      .getRawMany();

    const eventos = eventosRaw.map(mapRawEvento);

    // 3️⃣ Cargar zonas en un solo query
    const zonas = await this.zonaRepository.createQueryBuilder("z")
      .select([
        "z.id",
        "z.nombre",
        "z.eventoId",
        "t1.precio AS normal",
        "t2.precio AS preventa"
      ])
      .leftJoin("z.tarifaNormal", "t1")
      .leftJoin("z.tarifaPreventa", "t2")
      .where("z.eventoId IN (:...ids)", { ids })
      .getRawMany();

    // 4️⃣ Agrupar zonas
    const map = new Map<number, any[]>();
    zonas.forEach(z => {
      const eventId = z.eventoId;
      if (!map.has(eventId)) map.set(eventId, []);
      map.get(eventId)!.push(z);
    });

    eventos.forEach(e => { e.zonas = map.get(e.id) || []; });

    // 5️⃣ Filtro de precios en memoria
    if (typeof filtros.precioMin === "number" || typeof filtros.precioMax === "number") {
      return eventos.filter(e =>
        e.zonas.some(z => {
          const precios = [
            z.tarifaNormal?.precio,
            z.tarifaPreventa?.precio
          ].filter(p => typeof p === "number");

          return precios.some(p =>
            (filtros.precioMin != null ? p >= filtros.precioMin : true) &&
            (filtros.precioMax != null ? p <= filtros.precioMax : true)
          );
        })
      );
    }

    return eventos;
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
        documentosRespaldo: true,
        terminosUso: true,
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

    qb.leftJoin("evento.ordenesCompra", "ordenCompra")
      .leftJoin("ordenCompra.cliente", "cliente")
      .select("cliente.email", "email")
      .where("evento.id = :eventoId", { eventoId })
      .andWhere("ordenCompra.estado = :estado", { estado: "COMPLETADA" })
      .distinct(true);

    const resultados = await qb.getRawMany<{ email: string }>();
    return resultados.map(r => r.email);
  }

  async obtenerTodosLosEventos(): Promise<Evento[]> {
    return await this.repository.find({
      relations: {
        organizador: true, // Para saber quién es el organizador
        artista: true,  // Para ver el artista principal
        zonas: true,
        cola: true,
        terminosUso: true,
        documentosRespaldo: true,
      },
      order: {
        fechaEvento: "DESC", // O "ASC" si prefieres ver los más próximos primero
      },
    });
  }

  async listarEventosAdmin(filtros: IFiltrosEventoAdmin): Promise<Evento[]> {
    const qb = this.repository.createQueryBuilder("evento");

    // 1. SELECCIÓN EXPLÍCITA DE CAMPOS DEL EVENTO (Sin imágenes)
    qb.select([
      "evento.id",
      "evento.nombre",
      "evento.fechaEvento",
      "evento.fechaPublicacion",
      "evento.aforoTotal",
      "evento.entradasVendidas",
      "evento.gananciaTotal",
    ]);

    // 2. Uniones con otras tablas (Relaciones)

    // Organizador: Traemos datos básicos para mostrar en la tabla
    qb.leftJoin("evento.organizador", "organizador")
      .addSelect([
        "organizador.id",
        "organizador.nombre",
        "organizador.apellidoPaterno",
        "organizador.email",
        "organizador.rol",
        "organizador.RazonSocial",
      ]);


    // 3. APLICACIÓN DE FILTROS

    // Filtro por Rango de Fechas
    if (filtros.fechaInicio && filtros.fechaFin) {
      qb.andWhere("evento.fechaEvento BETWEEN :inicio AND :fin", {
        inicio: filtros.fechaInicio,
        fin: filtros.fechaFin,
      });
    } else if (filtros.fechaInicio) {
      qb.andWhere("evento.fechaEvento >= :inicio", { inicio: filtros.fechaInicio });
    } else if (filtros.fechaFin) {
      qb.andWhere("evento.fechaEvento <= :fin", { fin: filtros.fechaFin });
    }

    // Filtro por Nombre del Evento (parcial, sin distinguir mayúsculas)
    if (filtros.nombreEvento) {
      qb.andWhere("evento.nombre LIKE :nombreEvento", {
        nombreEvento: `%${filtros.nombreEvento}%`
      });
    }

    // Filtro por Organizador (Nombre, Apellido o Email)
    if (filtros.nombreOrganizador) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb.where("organizador.nombre LIKE :nombreOrg", { nombreOrg: `%${filtros.nombreOrganizador}%` })
            .orWhere("organizador.apellidoPaterno LIKE :nombreOrg", { nombreOrg: `%${filtros.nombreOrganizador}%` })
        })
      );
    }

    // Ordenar por fecha descendente (lo más nuevo primero)
    qb.orderBy("evento.fechaEvento", "DESC");

    return await qb.getMany();
  }

  async actualizarGananciaTotal(eventoId: number, monto: number): Promise<void> {
    await this.repository.increment({ id: eventoId }, "gananciaTotal", monto);
  }
}

export const eventoRepository = EventoRepository.getInstance();
