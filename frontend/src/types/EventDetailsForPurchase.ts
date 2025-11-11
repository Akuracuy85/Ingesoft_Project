import { type Event } from '../models/Event'; 
import { type ZonePurchaseDetail } from './ZonePurchaseDetail'; 

export type EventDetailsForPurchase = Event & { 
  description: string;
  artistName: string;
  zonasDisponibles: ZonePurchaseDetail[]; 
  limiteEntradas: number; 
};