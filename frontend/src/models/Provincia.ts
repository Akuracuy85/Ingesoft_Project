import { type Distrito } from "./Distrito.ts";

export interface Provincia {
  id: number;
  nombre: string;
  distritos: Distrito[];
}