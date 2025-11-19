// src/services/PerfilService.ts

import HttpClient from "./Client";
import { type User, type UserFormData } from "../models/User";
import type { Tarjeta } from "@/models/Tarjeta";

// --- INTERFACES ---
export interface PaymentMethod {
  id?: number;
  lastFourDigits: string;
}

export interface PointsInfo {
  totalPoints: number;
}


class PerfilService {
  private client = new HttpClient("/perfil");

  /** Obtiene el perfil completo del usuario autenticado */
  async getProfile(): Promise<User> {
    try {
      const response = await this.client.get<any>("/");

      if (!response.data) {
        throw new Error("Respuesta del servidor incompleta o sin datos de perfil.");
      }

      const profileData = response.data as User;
      return profileData;
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      throw error;
    }
  }

  /** Actualiza los datos del perfil */
  async updateProfile(payload: Partial<UserFormData>): Promise<User> {
    const response = await this.client.put<any>("/", payload);
    return response.data as User;
  }

  /** Elimina un método de pago del usuario */
  async deletePaymentMethod(tarjetaId: number): Promise<void> {
    await this.client.delete(`/tarjeta/${tarjetaId}`);
  }

  async guardarTarjeta(tarjeta: Tarjeta): Promise<void> {
    await this.client.post("/tarjeta", tarjeta);
  }

  /** Obtiene los puntos actuales del usuario */
  async getPuntos(): Promise<PointsInfo> {
    try {
      const response = await this.client.get<any>("/puntos");

      const pointsValue = response?.data?.puntos;
      if (typeof pointsValue === "number") {
        return { totalPoints: pointsValue };
      }

      if (typeof response === "number") {
        return { totalPoints: response };
      }

      console.warn("Respuesta inesperada al obtener puntos:", response);
      return { totalPoints: 0 };
    } catch (error) {
      console.error("Error al obtener puntos:", error);
      return { totalPoints: 0 };
    }
  }
}

export default new PerfilService();