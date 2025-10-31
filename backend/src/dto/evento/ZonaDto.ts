import { Tarifa } from "../../models/Tarifa";

export interface ZonaDto {
  id?: number;
  nombre: string;
  capacidad: number;
  tarifaNormal: Tarifa;
  tarifaPreventa: Tarifa;
  cantidadComprada?: number;
}
