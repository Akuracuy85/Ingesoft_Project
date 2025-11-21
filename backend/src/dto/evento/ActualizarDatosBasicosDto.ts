import { EstadoEvento } from "../../enums/EstadoEvento";

export interface ActualizarDatosBasicosDto {
  nombre: string;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  artistaId: number;
  lugar: string;
  departamento: string;
  provincia: string;
  distrito: string;
  estado: EstadoEvento;
}
