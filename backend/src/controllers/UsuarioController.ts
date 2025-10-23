import { Request, Response } from "express";
import { UsuarioService } from "@/services/UsuarioService";
import { HandleResponseError } from "@/utils/Errors";

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

  async obtenerPorId(req: Request, res: Response) {
    try {
      const usuario = await this.usuarioService.buscarPorId(Number(req.params.id));
      res.json(usuario);
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  async obtenerPorRol(req: Request, res: Response) {
    try {
      const usuarios = await this.usuarioService.buscarPorRol(req.params.rol as any);
      res.json(usuarios);
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const usuario = await this.usuarioService.crearUsuario(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  async editar(req: Request, res: Response) {
    try {
      const usuario = await this.usuarioService.editarUsuario(Number(req.params.id), req.body);
      res.json(usuario);
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  async borrar(req: Request, res: Response) {
    try {
      await this.usuarioService.desactivarUsuario(Number(req.params.id));
      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

}

export const usuarioController = UsuarioController.getInstance();
