import { Request, Response } from "express";
import { EventoService } from "@/services/EventoService";
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";

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

  obtenerDatosBasicos = async (_req: Request, res: Response) => {
    try {
      const eventos = await this.eventoService.obtenerDatosBasicos();
      res.status(StatusCodes.OK).json({
        success: true,
        eventos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  crearEvento = async (req: Request, res: Response) => {
    try {
      const evento = await this.eventoService.crearEvento(req.body);
      res.status(StatusCodes.CREATED).json({
        success: true,
        eventoId: evento.id,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };
}

export const eventoController = EventoController.getInstance();
