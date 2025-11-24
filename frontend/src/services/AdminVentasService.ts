import HttpClient from "./Client";
import type { AccionResponse } from "@/models/Accion";

class AdminVentasService extends HttpClient {
  constructor() {
    super("/admin/listar");
  }

  async obtenerAcciones(params?: {
    fechaInicio?: string;
    fechaFin?: string;
    tipo?: string;
    autorId?: number;
  }): Promise<AccionResponse> {
    try {
      const response = await super.get<AccionResponse>("/", { params });
      return response;
    } catch (error) {
      console.error("Error obteniendo acciones internas:", error);
      throw error;
    }
  }
}

export const adminVentasService = new AdminVentasService();
