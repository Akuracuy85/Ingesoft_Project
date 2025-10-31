import { ZonaDto } from "../evento/ZonaDto"; // Reusa tu DTO de Zona

/**
 * @description Estructura de datos específica para el proceso de compra.
 * Debe ser compatible con EventDetailsForPurchase del frontend.
 */
export interface EventDetailsForPurchaseDTO {
    // Propiedades heredadas de Event / EventListDTO
    id: number;
    title: string; // Asumiendo que el mapper cambia 'nombre' a 'title'
    description: string;
    date: string;
    location: string; // Ejemplo de ubicación
    imageUrl: string; // Ejemplo de imagen
    
    // Propiedades adicionales para la compra
    zonasDisponibles: ZonaDto[]; // Usamos el DTO de Zona del backend
    limiteEntradas: number;
}