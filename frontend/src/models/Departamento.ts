import { type Provincia } from "./Provincia.ts";

export interface Departamento {
  id: number;
  nombre: string;
  provincias: Provincia[];
}