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
    super("/usuario"); 
  }

  async getById(id: number): Promise<{ success: boolean; usuario: Usuario }> {
    return await this.get(`/${id}`);
  }

  async getByRol(rol: string): Promise<{ success: boolean; usuarios: Usuario[] }> {
    return await this.get(`/rol/${rol}`);
  }

  async create(data: Partial<Usuario>): Promise<{ success: boolean; message?: string }> {
    return await this.post("/", data);
    }

  async update(id: number, data: Partial<Usuario>): Promise<{ success: boolean }> {
    return await this.put(`/${id}`, data);
  }

  async remove(id: number): Promise<{ success: boolean; message?: string }> {
    return await this.delete(`/${id}`);
  }

  async activate(id: number): Promise<{ success: boolean }> {
    return await this.patch(`/activar/${id}`);
  }

  async deactivate(id: number): Promise<{ success: boolean }> {
    return await this.patch(`/desactivar/${id}`);
  }
}

export default new UsuarioService();
