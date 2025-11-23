import { Request, Response } from "express";
import { UsuarioService } from "../services/UsuarioService";
import { HandleResponseError } from "../utils/Errors";
import { StatusCodes } from "http-status-codes";

export class UsuarioController {
  private static instance: UsuarioController;
  private usuarioService: UsuarioService;

  private constructor() {
    this.usuarioService = UsuarioService.getInstance();
  }

  public static getInstance(): UsuarioController {
    if (!UsuarioController.instance) {
      UsuarioController.instance = new UsuarioController();
    }
    return UsuarioController.instance;
  }

  obtenerPorId = async (req: Request, res: Response) => {
    try {
      const usuario = await this.usuarioService.buscarPorId(Number(req.params.id));
      res.status(StatusCodes.OK).json({
        success: true,
        usuario: usuario
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  obtenerPorRol = async (req: Request, res: Response) => {
    try {
      const usuarios = await this.usuarioService.buscarPorRol(req.params.rol as any);
      res.status(StatusCodes.OK).json({
        success: true,
        usuarios: usuarios
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  crearUsuario = async (req: Request, res: Response) => {
    try {
      await this.usuarioService.crearUsuario(req.body);
      res.status(StatusCodes.CREATED).json({
        success: true,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  editarUsuario = async (req: Request, res: Response) => {
    try {
      await this.usuarioService.editarUsuario(Number(req.params.id), req.body, req.author);
      res.status(StatusCodes.OK).json({
        success: true,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  borrar = async (req: Request, res: Response) => {
    const idUsuarioObjetivo = Number(req.params.id);

    // 1. Validación del ID
    if (!Number.isInteger(idUsuarioObjetivo) || idUsuarioObjetivo <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del usuario no es válido",
      });
    }

    // 2. Validación del Autor (Administrador)
    const autor = req.author;
    if (!autor) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      // 3. Llamada al Servicio (pasando ID y Autor)
      await this.usuarioService.desactivarUsuario(idUsuarioObjetivo, autor);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Usuario eliminado correctamente",
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  activar = async (req: Request, res: Response) => {
    const idUsuarioObjetivo = Number(req.params.id);

    // 1. Validar ID
    if (!Number.isInteger(idUsuarioObjetivo) || idUsuarioObjetivo <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del usuario no es válido",
      });
    }

    // 2. Validar Autor
    const autor = req.author;
    if (!autor) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      // 3. Llamada al servicio
      await this.usuarioService.activarUsuario(idUsuarioObjetivo, autor);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Usuario activado correctamente",
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  desactivar = async (req: Request, res: Response) => {
    const idUsuarioObjetivo = Number(req.params.id);

    // 1. Validar ID
    if (!Number.isInteger(idUsuarioObjetivo) || idUsuarioObjetivo <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del usuario no es válido",
      });
    }

    // 2. Validar Autor
    const autor = req.author;
    if (!autor) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      // 3. Llamada al servicio
      await this.usuarioService.desactivarUsuario(idUsuarioObjetivo, autor);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Usuario desactivado correctamente",
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  obtenerTodos = async (req: Request, res: Response) => {
    try {
      const usuarios = await this.usuarioService.getAllUser();

      res.status(StatusCodes.OK).json({
        success: true,
        usuarios: usuarios,
        message: "Lista de usuarios obtenida correctamente."
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

}

export const usuarioController = UsuarioController.getInstance();
