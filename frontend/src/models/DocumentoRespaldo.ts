export interface DocumentoRespaldo {
  id?: number;
  nombreArchivo: string;
  tipo: string; // MIME o extensión
  tamano: number;
  url: string;
  estado: 'Pendiente' | 'Aprobado'; // UI solamente (backend no provee estado, se asume Pendiente)
}

