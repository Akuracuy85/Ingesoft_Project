/**
 * @description Estructura de Zona usada ESPECÍFICAMENTE para el proceso de compra.
 * Coincide directamente con el DTO de Zona enviado por el backend.
 */
export interface ZonePurchaseDetail {
    id: number;
    nombre: string; // <-- El nombre real de la propiedad que envía el backend
    capacidad: number; // Aforo total de esta zona
    costo: number; // <-- El precio real de la propiedad que envía el backend
    cantidadComprada: number; // Entradas ya vendidas en esta zona
}