import { Request, Response } from "express";
import { PerfilService } from "../services/PerfilService";
import { HandleResponseError } from "../utils/Errors";
import { StatusCodes } from "http-status-codes";
import { Usuario } from "../models/Usuario";
import { Tarjeta } from "../models/Tarjeta";

export class PerfilController {
  private static instance: PerfilController;
  private perfilService: PerfilService;

  private constructor() {
    this.perfilService = PerfilService.getInstance();
  }

  public static getInstance(): PerfilController {
    if (!PerfilController.instance) {
      PerfilController.instance = new PerfilController();
    }
    return PerfilController.instance;
  }

  actualizarPerfil = async (req: Request, res: Response) => {
    try {
      const userId = req.userId; // Extraído del middleware
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "No autorizado perfil 1",
        });
      }

      const nuevosDatos = req.body;

      await this.perfilService.actualizarPerfilUsuario(userId, nuevosDatos);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Perfil actualizado correctamente",
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  obtenerPerfil =
    async (req: Request, res: Response) => {
      try {
        const userId = req.userId;

        if (!userId) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "No autorizado perfil 2",
          });
        }
        const usuario: Usuario = await this.perfilService.obtenerPerfilUsuario(userId);
        res.status(StatusCodes.OK).json({
          success: true,
          data: usuario,
          message: "Perfil obtenido correctamente",
        });
      } catch (error) {
        HandleResponseError(res, error);
      }
    }

  agregarTarjeta = async (req: Request, res: Response) => {
    const tarjeta = req.body as Tarjeta;
    try {
      await this.perfilService.agregarTarjetaUsuario(req.userId, tarjeta);
      res.status(StatusCodes.OK).json({
        success: true,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }

  }

  eliminarTarjeta = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      const tarjetaId = parseInt(req.params.tarjetaId);

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "No autorizado perfil 3",
        });
      }

      if (isNaN(tarjetaId) || tarjetaId <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "ID de tarjeta inválido.",
        });
      }

      await this.perfilService.eliminarTarjetaUsuario(userId, tarjetaId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Tarjeta eliminada correctamente."
      });

    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  obtenerPuntos = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "No autorizado perfil 4",
        });
      }

      const puntos = await this.perfilService.obtenerPuntosCliente(userId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: { puntos: puntos },
        message: "Puntos obtenidos correctamente",
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

}

export const perfilController = PerfilController.getInstance();