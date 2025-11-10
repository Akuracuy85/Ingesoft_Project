// src/services/CompraService.ts
import HttpClient from "./Client";
import { type CrearOrdenDto } from "../types/CrearOrdenDTO";

export type CrearOrdenResponse = {
  success: boolean;
  ordenId: number;
  paymentUrl: string;
};

interface ApiResponseData<T> {
  success: boolean;
  data: T;
}

interface EntradasCountResponse {
  cantidad: number;
}

class CompraService extends HttpClient {
  constructor() {
    super("/orden");
  }

  /**
   * 🧾 Crea una nueva orden de compra y devuelve el ID y la URL de pago.
   */
  async crearOrden(payload: CrearOrdenDto): Promise<CrearOrdenResponse> {
    const respuesta = await super.post("", payload);
    return {
      success: respuesta.success,
      ordenId: respuesta.ordenId,
      paymentUrl: respuesta.paymentUrl,
    };
  }

  /**
   * 📊 Obtiene la cantidad de entradas del usuario para un evento.
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

  /**
   * ✅ Confirma una orden estándar (normal), asignando puntos.
   */
  async confirmarStandar(ordenId: number): Promise<any> {
    return super.patch(`/${ordenId}/confirmar-standar`, {});
  }

  /**
   * 💎 Confirma una orden de preventa (preferencial), restando puntos.
   */
  async confirmarPreventa(ordenId: number): Promise<any> {
    return super.patch(`/${ordenId}/confirmar-preventa`, {});
  }
}

export default new CompraService();
