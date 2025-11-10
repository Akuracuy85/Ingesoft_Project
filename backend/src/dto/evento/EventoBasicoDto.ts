import { EstadoEvento } from "../../enums/EstadoEvento";

export interface EventoBasicoDto {
  nombre: string;
  fecha: Date;
  estado: EstadoEvento;
}
