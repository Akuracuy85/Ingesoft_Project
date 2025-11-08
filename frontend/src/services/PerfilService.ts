// src/services/PerfilService.ts

import HttpClient from "./Client";
import { type User, type UserFormData } from "../models/User";

// --- INTERFACES ---
export interface PaymentMethod {
  id?: number;
  lastFourDigits: string;
}

export interface UserProfileResponse extends User {
  tarjetas?: {
    lastFourDigits: string | number;
    id: number;
    numeroCuenta: number | string;
  }[];
}

export interface PointsInfo {
  totalPoints: number;
}

// --- HELPERS ---
const getLastFourDigits = (cuenta: number | string | undefined): string => {
  if (!cuenta) return "";
  const str = String(cuenta);
  return str.length > 4 ? str.slice(-4) : str;
};

const mapTarjetasToFrontend = (tarjetasBackend: any[] | undefined): PaymentMethod[] => {
  if (!tarjetasBackend || tarjetasBackend.length === 0) return [];
  return tarjetasBackend.map((t) => ({
    id: t.id,
    lastFourDigits: getLastFourDigits(t.numeroCuenta),
  }));
};

// --- SERVICE CLASS ---
class PerfilService {
  private client = new HttpClient("/perfil");

  /** Obtiene el perfil completo del usuario autenticado */
  async getProfile(): Promise<UserProfileResponse> {
    try {
      const response = await this.client.get<any>("/");

      if (!response.data) {
        throw new Error("Respuesta del servidor incompleta o sin datos de perfil.");
      }

      const profileData = response.data as UserProfileResponse;
      const mappedTarjetas = mapTarjetasToFrontend(profileData.tarjetas);
      (profileData as any).tarjetas = mappedTarjetas;

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