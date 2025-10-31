// src/services/UsuarioService.ts
import HttpClient from "./Client";

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rol: string;
  activo?: boolean;
}

export class UsuarioService extends HttpClient {
  constructor() {
    super("/usuario"); // basePath según las rutas del backend
  }

  /**
   * Obtiene un usuario por su ID
   */
  async getById(id: number): Promise<{ success: boolean; usuario: Usuario }> {
    return await this.get(`/${id}`);
  }

  /**
   * Obtiene todos los usuarios con un rol específico
   */
  async getByRol(rol: string): Promise<{ success: boolean; usuarios: Usuario[] }> {
    return await this.get(`/rol/${rol}`);
  }

  /**
   * Crea un nuevo usuario
   */
  async create(data: Partial<Usuario>): Promise<{ success: boolean; message?: string }> {
    return await this.post("/", data);
    }

  /**
   * Edita un usuario existente
   */
  async update(id: number, data: Partial<Usuario>): Promise<{ success: boolean }> {
    return await this.put(`/${id}`, data);
  }

  /**
   * Elimina (lógicamente) un usuario
   */
  async remove(id: number): Promise<{ success: boolean; message?: string }> {
    return await this.delete(`/${id}`);
  }

  /**
   * Activa un usuario
   */
  async activate(id: number): Promise<{ success: boolean }> {
    return await this.patch(`/activar/${id}`);
  }

  /**
   * Desactiva un usuario
   */
  async deactivate(id: number): Promise<{ success: boolean }> {
    return await this.patch(`/desactivar/${id}`);
  }
}

// Exportamos una instancia única (singleton)
export default new UsuarioService();
