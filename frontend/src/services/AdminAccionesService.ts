import HttpClient from "./Client";
import type { AccionResponse } from "@/models/Accion";

class AdminAccionesService extends HttpClient {
  constructor() {
    super("/acciones");
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

  async exportarReporteAcciones(params?: {
    fechaInicio?: string;
    fechaFin?: string;
    tipo?: string;
    autorId?: number;
  }): Promise<Blob> {
    try {
      const response = await super.get<Blob>("/reporte", { 
        params,
        responseType: 'blob' 
      });
      return response;
    } catch (error) {
      console.error("Error descargando el reporte:", error);
      throw error;
    }
  }
}

export const adminAccionesService = new AdminAccionesService();
