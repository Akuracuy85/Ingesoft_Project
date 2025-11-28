export interface TarifaDto {
  id?: number;
  nombre: string;
  precio: number;
  // Las fechas pueden ser null si la información no está disponible
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

