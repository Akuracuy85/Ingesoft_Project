import HttpClient from "./Client";
import type { User, UserFormData } from "../models/User";

class UserService extends HttpClient {
  constructor() {
    super("/users");
  }

  async getAll(): Promise<User[]> {
    const res = await this.get<any>("");
    return Array.isArray(res) ? res : res?.data || [];
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
    const newStatus = currentStatus === "Activo" ? "Inactivo" : "Activo";
    const res = await this.patch<User>(`/${id}`, { status: newStatus });
    return res;
  }

  async remove(id: number): Promise<void> {
    await this.delete(`/${id}`);
  }
}

export const userService = new UserService();
