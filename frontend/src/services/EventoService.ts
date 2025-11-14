// src/services/EventoService.ts

import { type Event } from "../models/Event";
import HttpClient from "./Client";
import { type ZonePurchaseDetail } from "../types/ZonePurchaseDetail";
import { type FiltersType } from "../types/FiltersType";
import type { PriceRangeType } from "../types/PriceRangeType";

export type EventDetailsForPurchase = Event & {
  zonasDisponibles: ZonePurchaseDetail[];
  limiteEntradas: number;
};

// Utilidad: YYYY-MM-DD desde Date
const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

// Convierte filtros a query params
const mapFiltersToQueryParams = (
  filters: FiltersType
): Record<string, unknown> => {
  const params: Record<string, unknown> = {};

  if (filters.location?.departamento) params.departamento = filters.location.departamento;
  if (filters.location?.provincia) params.provincia = filters.location.provincia;
  if (filters.location?.distrito) params.distrito = filters.location.distrito;

  if (filters.categories && filters.categories.length > 0) params.categoriaIds = filters.categories;
  if (filters.artists && filters.artists.length > 0) params.artistaIds = filters.artists;

  if (filters.dateRange !== null) {
    const dr = filters.dateRange;
    if (dr.start) params.fechaInicio = formatDate(dr.start);
    if (dr.end) params.fechaFin = formatDate(dr.end);
  }

  if (filters.priceRange !== null) {
    const pr = filters.priceRange as PriceRangeType;
    if (pr.min !== null && pr.min !== undefined && pr.min !== "") params.precioMin = pr.min;
    if (pr.max !== null && pr.max !== undefined && pr.max !== "") params.precioMax = pr.max;
  }

  // Limpieza de valores vacíos
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => {
      if (v === null || v === undefined) return false;
      if (typeof v === "string" && v.trim() === "") return false;
      return true;
    })
  );
};

// Tipos auxiliares de respuesta
interface EventsWrapper<T = unknown> {
  success?: boolean;
  eventos?: T[];
  data?: T[];
}

interface EventoBasicoOrganizadorDTO {
  nombre: string;
  fecha: string | Date;
  estado: string;
}

function extractYMD(value: string | Date): string {
  if (typeof value === "string") {
    const m = value.match(/^\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : value;
  }
  const y = value.getFullYear();
  const m2 = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m2}-${d}`;
}

class EventoService extends HttpClient {
  constructor() {
    super("/evento");
  }

  async listar(filters: FiltersType): Promise<Event[]> {
    const path = "/publicados";
    const params = mapFiltersToQueryParams(filters);
    const respuesta = await super.get<EventsWrapper<Event> | Event[]>(path, { params });
    if (Array.isArray(respuesta)) return respuesta as Event[];
    if (respuesta && Array.isArray((respuesta as EventsWrapper<Event>).eventos)) {
      return (respuesta as EventsWrapper<Event>).eventos as Event[];
    }
    if (respuesta && Array.isArray((respuesta as EventsWrapper<Event>).data)) {
      return (respuesta as EventsWrapper<Event>).data as Event[];
    }
    return [];
  }

  async listarDestacados(): Promise<Event[]> {
    const today = new Date();
    const featuredFilter: FiltersType = {
      categories: [],
      artists: [],
      dateRange: { start: today, end: null },
      priceRange: null,
      location: { departamento: "", provincia: "", distrito: "" },
    };
    const params = mapFiltersToQueryParams(featuredFilter);
    const path = "/publicados";
    const respuesta = await super.get<EventsWrapper<Event> | Event[]>(path, { params });
    const eventos = Array.isArray(respuesta)
      ? (respuesta as Event[])
      : Array.isArray((respuesta as EventsWrapper<Event>).eventos)
      ? ((respuesta as EventsWrapper<Event>).eventos as Event[])
      : Array.isArray((respuesta as EventsWrapper<Event>).data)
      ? ((respuesta as EventsWrapper<Event>).data as Event[])
      : [];
    return eventos.slice(0, 5);
  }

  async buscarDatosCompraPorId(id: string): Promise<EventDetailsForPurchase> {
    if (!id) throw new Error("Se requiere un ID de evento para la búsqueda de compra.");
    const path = `/compra/${id}`;
    return await super.get<EventDetailsForPurchase>(path);
  }

  async obtenerPorId(id: number): Promise<Event> {
    if (!id) throw new Error("Se requiere un ID válido de evento");
    const respuesta = await super.get<{ success?: boolean; evento: Event }>(`/${id}`);
    return respuesta.evento;
  }

  // Nuevo: listado básico para organizador
  async listarBasicosOrganizador(): Promise<{ eventos: EventoBasicoOrganizadorDTO[] }> {
    const resp = await super.get<
      EventsWrapper<EventoBasicoOrganizadorDTO> | EventoBasicoOrganizadorDTO[]
    >("/basicos");

    const eventos = Array.isArray(resp)
      ? (resp as EventoBasicoOrganizadorDTO[])
      : Array.isArray((resp as EventsWrapper<EventoBasicoOrganizadorDTO>).eventos)
      ? ((resp as EventsWrapper<EventoBasicoOrganizadorDTO>).eventos as EventoBasicoOrganizadorDTO[])
      : Array.isArray((resp as EventsWrapper<EventoBasicoOrganizadorDTO>).data)
      ? ((resp as EventsWrapper<EventoBasicoOrganizadorDTO>).data as EventoBasicoOrganizadorDTO[])
      : [];

    const normalizados = eventos.map((e) => ({
      nombre: e.nombre ?? "",
      fecha: extractYMD(e.fecha),
      estado: e.estado ?? "BORRADOR",
    }));

    return { eventos: normalizados };
  }
}

const eventoServiceInstance = new EventoService();

// Función nombrada para facilitar el consumo tipado en componentes
export const listarBasicosOrganizador = () =>
  eventoServiceInstance.listarBasicosOrganizador();

export default eventoServiceInstance;
export type { EventoBasicoOrganizadorDTO };
