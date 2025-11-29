export interface Documento {
  id?: number;
  nombre: string;
  tipo: string;
  estado: "Aprobado" | "Pendiente";
}

