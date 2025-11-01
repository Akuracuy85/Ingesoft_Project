// src/services/EventoService.ts

import HttpClient from './Client';
import type { Event } from '../models/Event';
import type { ZonePurchaseDetail } from '../types/ZonePurchaseDetail';
import type { EventoBasicoDto } from '../types/EventoBasicoDto';

export type EventDetailsForPurchase = Event & {
  zonasDisponibles: ZonePurchaseDetail[];
  limiteEntradas: number;
  description?: string;
  artistName?: string;
};

class EventoService extends HttpClient {
  constructor() {
    super('/evento');
  }

  /**
   * Lista eventos publicados (catálogo público).
   * GET /api/evento/publicados
   */
  async listar(
    filters: Record<string, string | number | boolean | undefined> = {}
  ): Promise<Event[]> {
    const paramsObj: Record<string, string> = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null) paramsObj[k] = String(v);
    }
    const qs = new URLSearchParams(paramsObj).toString();
    const path = qs ? `/publicados?${qs}` : '/publicados';

    const res = await super.get<{ success: boolean; eventos: Event[] }>(path);
    return res.eventos;
  }

  /**
   * Datos para compra de un evento (público).
   * GET /api/evento/compra/:id
   */
  async buscarDatosCompraPorId(id: string): Promise<EventDetailsForPurchase> {
    if (!id) throw new Error('Se requiere un ID de evento');
    return await super.get<EventDetailsForPurchase>(`/compra/${id}`);
  }

  /**
   * Detalle público de un evento por ID.
   * GET /api/evento/:id
   */
  async obtenerPorId(id: number): Promise<Event> {
    if (!id) throw new Error('Se requiere un ID válido de evento');
    const res = await super.get<{ success: boolean; evento: Event }>(`/${id}`);
    return res.evento;
  }

  /**
   * Datos básicos para el organizador autenticado.
   * GET /api/evento/basicos
   */
  async listarBasicosOrganizador(): Promise<{
    success: boolean;
    eventos: EventoBasicoDto[];
  }> {
    return await super.get('/basicos');
  }
}

export default new EventoService();