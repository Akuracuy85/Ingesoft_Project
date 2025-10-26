import { EventoRepository, IFiltrosEvento } from "@/repositories/EventoRepository";
import { Evento } from "@/models/Evento";
import { CustomError } from "@/types/CustomError";
import { StatusCodes } from "http-status-codes";
import { EstadoEvento } from "@/enums/EstadoEvento";

export class EventoService {
  private static instance: EventoService;
  private eventoRepository: EventoRepository;

  private constructor() {
    this.eventoRepository = EventoRepository.getInstance();
  }

  public static getInstance(): EventoService {
    if (!EventoService.instance) {
      EventoService.instance = new EventoService();
    }
    return EventoService.instance;
  }

  /**
   * Obtiene la lista de eventos publicados, aplicando filtros.
   */
  async listarEventosPublicados(filtros: IFiltrosEvento): Promise<Evento[]> {
    try {
      // Pasamos los filtros al repositorio
      const eventos = await this.eventoRepository.listarEventosFiltrados(filtros);

      if (!eventos || eventos.length === 0) {
        throw new CustomError("No se encontraron eventos que coincidan con los filtros.", StatusCodes.NOT_FOUND);
      }

      return eventos;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al obtener el listado de eventos", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Obtiene el detalle de un solo evento por ID.
   */
  async obtenerDetalleEvento(id: number): Promise<Evento> {
    try {
        const evento = await this.eventoRepository.buscarPorId(id);
        if (!evento) {
            throw new CustomError("Evento no encontrado", StatusCodes.NOT_FOUND);
        }
        return evento;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError("Error al obtener el detalle del evento", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Crea un nuevo evento.
   */
  async crearEvento(data: Partial<Evento>): Promise<Evento> {
    try {
      // Lógica de negocio: Asignar valores por defecto al crear
      data.entradasVendidas = 0;
      data.gananciaTotal = 0;

      // Si no te mandan un estado, lo ponemos como BORRADOR
      if (!data.estado) {
        data.estado = EstadoEvento.BORRADOR; 
      }
      
      const nuevoEvento = await this.eventoRepository.crearEvento(data);
      return nuevoEvento;

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al crear el evento", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const eventoService = EventoService.getInstance();