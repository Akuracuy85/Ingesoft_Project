import { EstadoEvento } from "@/enums/EstadoEvento";

export interface CrearEventoDto {
  nombre: string;
  descripcion: string;
  fecha: string; // formato YYYY-MM-DD
  hora: string; // formato HH:mm
  departamento: string;
  provincia: string;
  distrito: string;
  estado: EstadoEvento;
  imagenPortada?: string; // base64 opcional
}
