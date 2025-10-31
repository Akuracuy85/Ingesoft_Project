// src/types/EventDetailsForPurchase.ts

import { type Event } from '../models/Event'; 
import { type ZonePurchaseDetail } from './ZonePurchaseDetail'; // <-- ¡Importar el nuevo tipo!

/**
 * @description Define la estructura de datos específicos que el backend retorna 
 * para el proceso de compra de un evento.
 */
// Utilizamos la intersección (Event & ...) para heredar las propiedades,
// pero agregamos las propiedades faltantes que el mapper del backend sí envía.
export type EventDetailsForPurchase = Event & { 
    // Hereda id, title, date, time, place, image (según src/models/Event.ts)
    
    // --- Propiedades que el backend envía pero que NO están en tu tipo base Event ---
    description: string;
    artistName: string;
    
    // Propiedades específicas para la compra:
    // Utilizamos el tipo dedicado para evitar el conflicto con Zone
    zonasDisponibles: ZonePurchaseDetail[]; 
    
    // Límite de entradas que un usuario puede comprar.
    limiteEntradas: number; 
};