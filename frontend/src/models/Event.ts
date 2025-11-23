import type { Cola } from "./Cola";
import type { Zone } from "./Zone";
export interface Artist {
  id: number;
  nombre: string;
}

export interface Organizador {
  id: number;
  nombre: string;
  RUC?: string;
  RazonSocial?: string;
}

export interface BackendDocumentoDto { 
  id?: number;
  nombreArchivo: string;
  tipo: string;
  tamano: number;
  url: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;

  date: string;
  time: string;

  departamento: string;
  provincia: string;
  distrito: string;
  place: string;
  placeEspecific: string;
  lugar?: string | null;
  image: string;
  imageBanner?: string | null;
  imageLugar?: string | null;

  artist: Artist;

  category?: string;
  zonas: Zone[];
  cola?: Cola;
  estado: "PENDIENTE_APROBACION" | "PUBLICADO" | "CANCELADO";
  organizador: Organizador;
  documentosRespaldo: BackendDocumentoDto[];
  terminosUso: BackendDocumentoDto;
  fechaFinPreventa?: string | null; // NUEVO: fin preventa global YYYY-MM-DD
  fechaInicioPreventa?: string | null; // NUEVO: inicio preventa global YYYY-MM-DD
}