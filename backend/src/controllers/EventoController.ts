import { Request, Response } from "express";
import { EventoService } from "@/services/EventoService";
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";
import { IFiltrosEvento } from "@/repositories/EventoRepository";

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
   * Listado público de eventos publicados aplicando filtros opcionales.
   */
  listarPublicados = async (req: Request, res: Response) => {
    try {
      const filtros = req.query as IFiltrosEvento;
      const eventos = await this.eventoService.listarEventosPublicados(filtros);
      res.status(StatusCodes.OK).json({
        success: true,
        eventos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  /**
   * Devuelve el detalle público de un evento por identificador.
   */
  obtenerPorId = async (req: Request, res: Response) => {
    const eventoId = Number(req.params.id);

    if (!Number.isInteger(eventoId) || eventoId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del evento no es válido",
      });
    }

    try {
      const evento = await this.eventoService.obtenerDetalleEvento(eventoId);
      res.status(StatusCodes.OK).json({
        success: true,
        evento,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  obtenerDatosBasicos = async (req: Request, res: Response) => {
    const organizadorId = req.userId;

    if (!organizadorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      const eventos =
        await this.eventoService.obtenerDatosBasicos(organizadorId);
      res.status(StatusCodes.OK).json({
        success: true,
        eventos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  obtenerEventosDetallados = async (req: Request, res: Response) => {
    const organizadorId = req.userId;

    if (!organizadorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      const eventos = await this.eventoService.obtenerEventosDetallados(
        organizadorId
      );
      res.status(StatusCodes.OK).json({
        success: true,
        eventos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  crearEvento = async (req: Request, res: Response) => {
    const organizadorId = req.userId;

    if (!organizadorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      const evento = await this.eventoService.crearEvento(
        req.body,
        organizadorId
      );
      res.status(StatusCodes.CREATED).json({
        success: true,
        eventoId: evento.id,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  actualizarEvento = async (req: Request, res: Response) => {
    const organizadorId = req.userId;

    if (!organizadorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    const eventoId = Number(req.params.id);

    if (!Number.isInteger(eventoId) || eventoId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del evento no es válido",
      });
    }

    try {
      const evento = await this.eventoService.actualizarEvento(
        eventoId,
        req.body,
        organizadorId
      );
      res.status(StatusCodes.OK).json({
        success: true,
        eventoId: evento.id,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };
}

export const eventoController = EventoController.getInstance();
