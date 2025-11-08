import { Rol } from "../enums/Rol";
import { UsuarioService } from "../services/UsuarioService";
import { HandleResponseError } from "../utils/Errors";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// Middleware para verificar el rol del usuario, está hecho para que se use después del SessionMiddleware
// ya que depende de que el userId esté en la request y devolverá la informacion del usuario en la request
export class AutorMiddleware {

  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = UsuarioService.getInstance();
  }

  VerificarEsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    
    if(!req.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "No se encontró atributo userId en la request"
      });
    }

    try{
      req.author = await this.usuarioService.buscarPorId(req.userId!);
    } catch (error) {
      return HandleResponseError(res, error);
    }

    if(req.author.rol != Rol.ADMINISTRADOR){
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "No tiene permisos para realizar esta acción"
      });
    }

    next();
  }

  VerificarEsOrganizador = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "No se encontró atributo userId en la request"
      });
    }

    try{
      req.author = await this.usuarioService.buscarPorId(req.userId!);
    } catch (error) {
      return HandleResponseError(res, error);
    }

    if(req.author.rol != Rol.ORGANIZADOR){
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "No tiene permisos para realizar esta acción"
      });
    }

    next();
  }

  VerificarEsAdminUOrganizador = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "No se encontró atributo userId en la request"
      });
    }

    try{
      req.author = await this.usuarioService.buscarPorId(req.userId!);
    } catch (error) {
      return HandleResponseError(res, error);
    }

    if(req.author.rol == Rol.CLIENTE){
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "No tiene permisos para realizar esta acción"
      });
    }

    next();
  }

  VerificarEsCliente = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "No se encontró atributo userId en la request"
      });
    }

    try{
      req.author = await this.usuarioService.buscarPorId(req.userId!);
    } catch (error) {
      return HandleResponseError(res, error);
    }

    if(req.author.rol != Rol.CLIENTE){
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "No tiene permisos para realizar esta acción"
      });
    }

    next();
  }

}

export const autorMiddleware = new AutorMiddleware();