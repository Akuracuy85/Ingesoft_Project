// src/services/CompraService.ts

import HttpClient from "./Client";
import { type CrearOrdenDto } from "../types/CrearOrdenDTO";

export type CrearOrdenResponse = {
  ordenId: number;
  paymentUrl: string;
};

// Estructura genérica del backend
interface ApiResponseData<T> {
  success: boolean;
  data: T;
}

// Estructura de la respuesta del endpoint de conteo
interface EntradasCountResponse {
  cantidad: number;
}

class CompraService extends HttpClient {
  constructor() {
    super("/orden");
  }

  /**
   * Crea una nueva orden de compra y devuelve el ID y la URL de pago.
   */
  async crearOrden(payload: CrearOrdenDto): Promise<CrearOrdenResponse> {
    const respuesta = await super.post("", payload);

    return {
      ordenId: respuesta.ordenId,
      paymentUrl: respuesta.paymentUrl,
    };
  }

  /**
   * Obtiene la cantidad de entradas compradas por el usuario autenticado
   * para un evento específico.
   * @param eventoId - ID del evento
   */
  async getCantidadEntradasPorEvento(eventoId: number): Promise<number | null> {
    try {
      const respuesta = await super.get<ApiResponseData<EntradasCountResponse>>(
        `/mis-entradas/evento/${eventoId}/count`
      );

      if (respuesta.success && typeof respuesta.data.cantidad === "number") {
        return respuesta.data.cantidad;
      }

      console.warn("Respuesta inesperada al contar entradas:", respuesta);
      return null;
    } catch (error) {
      console.error("Error al obtener cantidad de entradas:", error);
      return null;
    }
  }
}

export default new CompraService();
