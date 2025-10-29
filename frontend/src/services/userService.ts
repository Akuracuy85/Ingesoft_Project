import api from "../lib/api";
import type { User, UserFormData } from "../models/User";

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get("/users");
    return data;
  },

  async create(userData: UserFormData): Promise<User> {
    const { data } = await api.post("/users", userData);
    return data;
  },

  async update(id: number, userData: UserFormData): Promise<User> {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  async toggleStatus(id: number): Promise<User> {
    const { data } = await api.patch(`/users/${id}/status`);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
