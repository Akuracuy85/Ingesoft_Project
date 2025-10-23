import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import { Usuario } from "@/models/Usuario";
import { Rol } from "@/enums/Rol";
import { CustomError } from "@/types/CustomError";
import { StatusCodes } from "http-status-codes"

export class UsuarioService {
  private static instance: UsuarioService;
  private usuarioRepository: UsuarioRepository;

  private constructor() {
    this.usuarioRepository = UsuarioRepository.getInstance();
  }

  public static getInstance(): UsuarioService {
    if (!UsuarioService.instance) {
      UsuarioService.instance = new UsuarioService();
    }
    return UsuarioService.instance;
  }

  async buscarPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
    return usuario;
  }

  async buscarPorRol(rol: Rol): Promise<Usuario[]> {
    return await this.usuarioRepository.buscarPorRol(rol);
  }

  async crearUsuario(usuario: Partial<Usuario>) {
    if (!usuario.password) throw new CustomError("La contraseña es obligatoria", StatusCodes.BAD_REQUEST);
    await usuario.hashearPassword();
    return await this.usuarioRepository.crearUsuario(usuario);
  }

  async editarUsuario(id: number, data: Partial<Usuario>) {
    delete data.password;
    const usuario = await this.usuarioRepository.actualizarUsuario(id, data);
    if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
    return usuario;
  }

  async borrarUsuario(id: number) {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
    return await this.usuarioRepository.borrarUsuario(usuario);
  }

  async activarUsuario(id: number) {
    const usuario = await this.usuarioRepository.actualizarUsuario(id, { activo: true });
    if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
    return usuario;
  }

  async desactivarUsuario(id: number) {
    const usuario = await this.usuarioRepository.actualizarUsuario(id, { activo: false });
    if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
    return usuario;
  }
}
