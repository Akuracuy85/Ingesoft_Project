import { EstadoEvento } from "../../enums/EstadoEvento";
import { DocumentoDto } from "./DocumentoDto";
import { ZonaDto } from "./ZonaDto";

export interface ActualizarEventoDto {
  nombre: string;
  descripcion: string;
  fecha: string; // formato YYYY-MM-DD
  hora: string; // formato HH:mm
  artistaId: number;
  lugar: string;
  departamento: string;
  provincia: string;
  distrito: string;
  estado: EstadoEvento;
  imagenPortada?: string | null; // base64 opcional, null para eliminar
  terminosUso?: DocumentoDto | null;
  documentosRespaldo?: DocumentoDto[];
  zonas?: ZonaDto[];
}
