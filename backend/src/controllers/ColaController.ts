import { Request, Response } from "express";
import { ColaService } from "../services/ColaService";
import { HandleResponseError } from "../utils/Errors";
import { StatusCodes } from "http-status-codes";

export class ColaController {
  private static instance: ColaController;
  private colaService: ColaService;

  private constructor() {
    this.colaService = ColaService.getInstance();
  }

  public static getInstance(): ColaController {
    if (!ColaController.instance) {
      ColaController.instance = new ColaController();
    }
    return ColaController.instance;
  }

  obtenerPosicion = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      const colaId = parseInt(req.params.colaId);
      if (isNaN(colaId) || colaId <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "ID de evento inválido.",
        });
      }

      const turnoCola = await this.colaService.obtenerPosicion(userId, colaId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: turnoCola,
        message: "Información de turno y puntos obtenida correctamente.",
      });

    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  actualizarHeartbeat = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const colaId = parseInt(req.params.colaId);

    await this.colaService.actualizarHeartbeat(userId, colaId);

    return res.status(200).json({ success: true });
  } catch (err) {
    HandleResponseError(res, err);
  }
};


  crearCola = async (req: Request, res: Response) => {
    try {
      const eventoId = parseInt(req.params.eventoId);
      if (isNaN(eventoId) || eventoId <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "ID de evento inválido.",
        });
      }

      await this.colaService.crearCola(eventoId);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Cola creada correctamente para el evento.",
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  ingresarUsuarioACola = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      const eventoId = parseInt(req.params.eventoId);
      if (isNaN(eventoId) || eventoId <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "ID de evento inválido.",
        });
      }
      await this.colaService.ingresarUsuarioACola(userId, eventoId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Usuario ingresado a la cola correctamente.",
      });
    }
    catch (error) {
      HandleResponseError(res, error);
    }
  }

  eliminarTurno = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      const colaId = parseInt(req.params.colaId);
      if (isNaN(colaId) || colaId <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "ID de cola inválido.",
        });
      }
      await this.colaService.eliminarTurno(userId, colaId);
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Turno eliminado correctamente.",
      });
    }
    catch (error) {
      HandleResponseError(res, error);
    }
  }

}

export const colaController = ColaController.getInstance();