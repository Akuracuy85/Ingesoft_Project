export interface DocumentoDto {
  id?: number;
  nombreArchivo: string;
  tipo: string; // lógico (terminos de uso | documento de respaldo)
  tamano: number;
  url?: string;
  contenidoBase64?: string;
  eventoId?: number; // nuevo campo para exponer relación
}
