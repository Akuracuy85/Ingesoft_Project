import { Rol } from "../enums/Rol";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { CustomError } from "../types/CustomError";
import { PasswordHasher } from "../types/PasswordHasher";
import { GenerarAccessToken, GenerarRefreshToken } from "../utils/JWTUtils";
import { access } from "fs";
import { StatusCodes } from "http-status-codes";


export class AuthService {
  private static instance: AuthService;
  private usuarioRepository: UsuarioRepository;

  private constructor() {
    this.usuarioRepository = UsuarioRepository.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async AutenticarUsuario(email: string, password: string): Promise<{accessToken: string, refreshToken: string, rol: Rol}> {
    
    let usuario = null
    try {
      usuario = await this.usuarioRepository.buscarPorEmail(email);
      if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al buscar usuario por email", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    try {
      const esPasswordValido = await PasswordHasher.verificar(password, usuario.password);
      if (!esPasswordValido) {
        throw new CustomError("Credenciales inválidas", StatusCodes.UNAUTHORIZED);
      }
    } catch (error){
      throw new CustomError("Error al verificar la contraseña", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    let res = {accessToken: "", refreshToken: "", rol: usuario.rol};
    try {
      res.accessToken = GenerarAccessToken(usuario.id);
      res.refreshToken = GenerarRefreshToken(usuario.id);
    } catch(error){
      throw new CustomError("Error al generar el token de sesión", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return res;
  }

}