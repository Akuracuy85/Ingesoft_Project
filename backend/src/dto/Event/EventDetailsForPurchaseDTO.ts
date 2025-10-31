import { Tarifa } from "../../models/Tarifa";

/**
 * @description Estructura de Zona simplificada para la respuesta de compra.
 * Corresponde al tipo 'Zone' del frontend.
 * 🚨 IMPORTANTE: Se eliminó 'costo' y se usaron las tarifas completas.
 */
export interface ZonaDTO { 
    id: number;
    nombre: string;
    capacidad: number; // Aforo total de esta zona
    cantidadComprada: number; // Entradas ya vendidas en esta zona
    
    // ✅ Propiedades que reemplazan a 'costo'
    tarifaNormal: Tarifa;
    tarifaPreventa: Tarifa;
}


/**
 * @description DTO de respuesta para la obtención de datos de un evento 
 * para el proceso de compra. Corresponde al tipo 'EventDetailsForPurchase' 
 * del frontend (Event & { zonasDisponibles, limiteEntradas }).
 */
export interface EventDetailsForPurchaseDTO {
    // --- Propiedades del Evento (Mapeadas) ---
    id: number;
    title: string;
    description: string;
    
    // Mapeo de fecha/hora en formato de lectura para el frontend
    date: string; // Ej: "21 de enero de 2025"
    time: string; // Ej: "19:30"
    
    place: string; // Ej: "Distrito, Provincia"
    image: string; // Imagen en formato Base64 con prefijo MIME (data:image/jpeg;base64,...)
    artistName: string;

    // --- Propiedades Específicas de Compra ---
    zonasDisponibles: ZonaDTO[]; // Array de zonas con precios y capacidades
    limiteEntradas: number; // Límite máximo de entradas por transacción (Ej: 10)
}