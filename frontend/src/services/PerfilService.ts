// src/services/PerfilService.ts

import HttpClient from "./Client";

// --- INTERFACES ---

// Estructura genérica que usa tu backend para respuestas
interface ApiResponseData<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Estructura del campo data específico para /perfil/puntos
interface PuntosResponse {
  puntos: number;
}

class PerfilService {
  private client = new HttpClient("/perfil");

  /**
   * Obtiene los puntos del cliente autenticado.
   * Requiere un token válido (sessionMiddleware.VerificarToken en el backend).
   */
  async getPuntos(): Promise<number | null> {
    try {
      const resp = await this.client.get<ApiResponseData<PuntosResponse>>("/puntos");

      // Verificamos que la respuesta sea válida
      if (resp.success && resp.data && typeof resp.data.puntos === "number") {
        return resp.data.puntos;
      }

      console.warn("Respuesta inesperada al obtener puntos:", resp);
      return null;
    } catch (error) {
      console.error("Error al obtener puntos del perfil:", error);
      return null;
    }
  }
}

export default new PerfilService();
