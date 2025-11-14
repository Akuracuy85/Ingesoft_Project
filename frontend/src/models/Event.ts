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

  artist: Artist;

  category?: string;
  zonas: Zone[];
  Cola?: Cola;
  estado: "PENDIENTE_APROBACION" | "PUBLICADO" | "CANCELADO";
  organizador: Organizador;
  documento: string;
}