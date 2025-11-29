import { TarifaDto } from "./TarifaDto";

export interface ZonaDto {
  id?: number;
  nombre: string;
  capacidad: number;
  cantidadComprada?: number;
  tarifaNormal?: TarifaDto | null;
  tarifaPreventa?: TarifaDto | null;
}
