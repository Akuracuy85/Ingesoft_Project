import { AppDataSource } from "@/database/data-source";
import { Evento } from "@/models/Evento";
import { Documento } from "@/models/Documento";
import { Zona } from "@/models/Zona";
import { Repository } from "typeorm";

export type EventoBasico = Pick<Evento, "nombre" | "fechaEvento" | "estado">;

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

  async obtenerDatosBasicosPorOrganizador(organizadorId: number): Promise<EventoBasico[]> {
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

  async obtenerEventosDetalladosPorOrganizador(
    organizadorId: number
  ): Promise<Evento[]> {
    return await this.repository.find({
      where: { organizador: { id: organizadorId } },
      relations: {
        organizador: true,
        zonas: true,
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
}
