export interface DocumentoDto {
  id?: number;
  nombreArchivo: string;
  tipo: string;
  tamano: number;
  url: string;
  contenidoBase64?: string;
}
