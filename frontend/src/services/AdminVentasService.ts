import HttpClient from "./Client";
import type { AdminVenta } from "@/types/Venta";

export interface FiltroVentas {
  fechaInicio?: string;
  fechaFin?: string;
  nombreEvento?: string;
  nombreOrganizador?: string;
}

class AdminVentasService extends HttpClient {
  constructor() {
    super("/evento/admin/listar");
  }

  async listarEventosAdmin(params?: FiltroVentas): Promise<AdminVenta[]> {
    try {
      const response = await super.get<{
        success: boolean;
        count: number;
        eventos: any[];
      }>("/", { params });

      return response.eventos.map((evt) => ({
        id: evt.id,
        nombreEvento: evt.nombre,
        fechaEvento: evt.fechaEvento,
        entradasVendidas: evt.entradasVendidas,
        gananciaTotal: evt.gananciaTotal,
        organizadorNombre: `${evt.organizador.nombre} ${evt.organizador.apellidoPaterno}`,
        organizadorRazonSocial: evt.organizador.RazonSocial,
      }));
    } catch (error) {
      console.error("Error obteniendo ventas:", error);
      throw error;
    }
  }

  async exportarReporteVentas(params?: FiltroVentas
  ): Promise<Blob> {
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

export const adminVentasService = new AdminVentasService();
