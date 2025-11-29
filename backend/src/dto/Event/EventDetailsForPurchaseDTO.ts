import { Tarifa } from "../../models/Tarifa";
export interface ZonaDTO { 
    id: number;
    nombre: string;
    capacidad: number;
    cantidadComprada: number;
    tarifaNormal: Tarifa;
    tarifaPreventa: Tarifa;
}

export interface EventDetailsForPurchaseDTO {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  place: string;
  image: string;
  imageLugar: string;
  artistName: string;
  zonasDisponibles: ZonaDTO[];
  limiteEntradas: number;
}