import type { Cola } from "./Cola";
import type { Zone } from "./Zone";
export interface Artist {
  id: number;
  nombre: string;
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

  image: string;

  artist: Artist;

  category?: string;
  zonas: Zone[];
  Cola?: Cola;
}