import { EstadoEvento } from "../../enums/EstadoEvento";
import { DocumentoDto } from "./DocumentoDto";
import { ZonaDto } from "./ZonaDto";

export interface EventoDetalleDto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: EstadoEvento;
  fechaEvento: string;
  departamento: string;
  provincia: string;
  distrito: string;
  fechaPublicacion: string;
  aforoTotal: number;
  entradasVendidas: number;
  codigoPrivado: string;
  gananciaTotal: number;
  artistaId?: number | null;
  imagenBanner?: string | null;
  imagenLugar?: string | null;
  terminosUso?: DocumentoDto | null;
  documentosRespaldo: DocumentoDto[];
  zonas: ZonaDto[];
}
