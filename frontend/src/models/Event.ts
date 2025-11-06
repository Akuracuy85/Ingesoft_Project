// src/models/Event.ts
import type { Zone } from "./Zone";

export interface Event {
  id: number;
  title: string;
  date: string;
  place: string;
  image: string;
  time: string;

  zonas?: Zone[];
}
