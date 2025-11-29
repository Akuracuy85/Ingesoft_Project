import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { Usuario } from "../models/Usuario";
import { Rol } from "../enums/Rol";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";
import { PasswordHasher } from "../types/PasswordHasher";
import { AccionRepository } from "../repositories/AccionRepository"; // 1. Importar Repository
import { TipoAccion } from "../enums/TipoAccion"; // 2. Importar Enum

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
    try {
      const usuario = await this.usuarioRepository.buscarPorId(id);
      if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
      return usuario;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al buscar usuario en la base de datos", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async buscarPorEmail(email: string): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.buscarPorEmail(email);
      if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
      return usuario;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al buscar usuario por email", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async buscarPorDNI(dni: string): Promise<Usuario | null> {
    try {
      const usuario = await this.usuarioRepository.buscarPorDNI(dni);
      if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
      return usuario;
    } catch (error) {
      throw new CustomError("Error al buscar usuario por DNI", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async buscarPorRol(rol: Rol): Promise<Usuario[]> {
    try {
      return await this.usuarioRepository.buscarPorRol(rol);;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al buscar usuarios por rol", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async crearUsuario(usuarioData: Partial<Usuario>) {
    try {
      if (!usuarioData.password) throw new CustomError("La contraseña es obligatoria", StatusCodes.BAD_REQUEST);
      if (!usuarioData.rol) throw new CustomError("El rol es obligatorio", StatusCodes.BAD_REQUEST);
      usuarioData.password = await PasswordHasher.hash(usuarioData.password)
      return await this.usuarioRepository.crearUsuario(usuarioData);
    } catch (error: any) {
      if (error instanceof CustomError) throw error;
      if (error && error.code === "ER_DUP_ENTRY") {
        throw new CustomError("El usuario ya existe", StatusCodes.CONFLICT);
      }
      throw new CustomError("Error al crear usuario: " + error, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async editarUsuario(id: number, data: Partial<Usuario>, autor: Usuario) {
    try {
      const usuarioExistente = await this.usuarioRepository.buscarPorId(id);
      if (!usuarioExistente) {
        throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
      }

      // LÓGICA DE PROTECCIÓN DE CONTRASEÑA
      if (data.password === "" || data.password === null || data.password === undefined) {
        // Si viene vacío o nulo, lo eliminamos del objeto 'data'.
        // Al usar QueryBuilder en el repo, este campo será ignorado y la BD conservará el valor anterior.
        delete data.password;
      } else {
        // Si viene una contraseña real, hay que hashearla antes de guardar
        data.password = await PasswordHasher.hash(data.password);
      }

      // Ahora 'data' solo tiene los campos que realmente queremos cambiar
      const usuarioActualizado = await this.usuarioRepository.actualizarUsuario(id, data);
      return usuarioActualizado;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al actualizar usuario", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async borrarUsuario(id: number, autor: Usuario) {
    try {
      const usuario = await this.usuarioRepository.buscarPorId(id);
      if (!usuario) throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
      await this.usuarioRepository.borrarUsuario(usuario);

      // 2. Registrar acción
      const accionRepo = AccionRepository.getInstance();
      await accionRepo.crearAccion({
        fechaHora: new Date(),
        descripcion: `Usuario ${usuario.email} eliminado permanentemente`,
        tipo: TipoAccion.DesactivarUsuario, // Usamos el tipo disponible en tu enum
        autor: autor,
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al eliminar usuario", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async activarUsuario(id: number, autor: Usuario) {
    try {
      const usuarioExistente = await this.usuarioRepository.buscarPorId(id);
      if (!usuarioExistente) {
        throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
      }
      await this.usuarioRepository.actualizarUsuario(id, { activo: true });

      //Registro Accion de admin
      const accionRepo = AccionRepository.getInstance();
      await accionRepo.crearAccion({
        fechaHora: new Date(),
        descripcion: `Usuario ${usuarioExistente.email} activado`,
        tipo: TipoAccion.ActivarUsuario,
        autor: autor, 
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al activar usuario", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async desactivarUsuario(id: number, autor: Usuario) {
    try {
      const usuarioExistente = await this.usuarioRepository.buscarPorId(id);
      if (!usuarioExistente) {
        throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
      }
      await this.usuarioRepository.actualizarUsuario(id, { activo: false });
      const accionRepo = AccionRepository.getInstance();
      await accionRepo.crearAccion({
        fechaHora: new Date(),
        descripcion: `Usuario ${usuarioExistente.email} desactivado`,
        tipo: TipoAccion.DesactivarUsuario,
        autor: autor,
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al desactivar usuario", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllUser(): Promise<Usuario[]> {
    try {
      // Llama al método del repositorio para obtener todos los usuarios
      return await this.usuarioRepository.getAllUser();
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al obtener todos los usuarios de la base de datos", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

}
