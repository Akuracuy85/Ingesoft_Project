import { Request, Response } from "express";
import { EventoService } from "@/services/EventoService";
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";
import { IFiltrosEvento } from "@/repositories/EventoRepository";
import { Evento } from "@/models/Evento";

export class EventoController {
  private static instance: EventoController;
  private eventoService: EventoService;

  private constructor() {
    this.eventoService = EventoService.getInstance();
  }

  public static getInstance(): EventoController {
    if (!EventoController.instance) {
      EventoController.instance = new EventoController();
    }
    return EventoController.instance;
  }

  /**
   * Maneja la solicitud GET para listar eventos publicados (con filtros)
   */
  listarPublicados = async (req: Request, res: Response) => {
    try {
      // ¡Aquí está la clave! req.query contiene todos los filtros
      const filtros: IFiltrosEvento = req.query;

      const eventos = await this.eventoService.listarEventosPublicados(filtros);
      res.status(StatusCodes.OK).json({
        success: true,
        eventos: eventos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  /**
   * Maneja la solicitud GET para obtener el detalle de un evento
   */
  obtenerPorId = async (req: Request, res: Response) => {
    try {
        const idEvento = Number(req.params.id);
        const evento = await this.eventoService.obtenerDetalleEvento(idEvento);
        res.status(StatusCodes.OK).json({
            success: true,
            evento: evento
        });
    } catch (error) {
        HandleResponseError(res, error);
    }
  }

  /**
   * Maneja la solicitud POST para crear un nuevo evento
   */
  crearEvento = async (req: Request, res: Response) => {
    try {
      const eventoData: Partial<Evento> = req.body;
      const nuevoEvento = await this.eventoService.crearEvento(eventoData);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        evento: nuevoEvento,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };
}

export const eventoController = EventoController.getInstance();