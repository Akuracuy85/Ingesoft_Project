import HttpClient from "./Client";
import type { User, UserFormData } from "../models/User";

class UserService extends HttpClient {
  constructor() {
    super("/usuario");
  }

  async getAll(token?: string): Promise<User[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await this.get<any>("/", { headers })
    return Array.isArray(res) ? res : res?.data || []
  }

  async create(userData: UserFormData): Promise<User> {
    const res = await this.post<User>("", userData);
    return res;
  }

  async update(id: number, userData: UserFormData): Promise<User> {
    const res = await this.put<User>(`/${id}`, userData);
    return res;
  }

  async toggleStatus(id: number, currentStatus: string): Promise<User> {
    const endpoint =
      currentStatus === "Activo" ? `/desactivar/${id}` : `/activar/${id}`; //Voy a confiar en Raul y el otro back
    const res = await this.patch<User>(endpoint);
    return res;
  }

  async remove(id: number): Promise<void> {
    await this.delete(`/${id}`);
  }
}

export const userService = new UserService();
