// src/models/Tarifa.ts

/**
 * @description Estructura de Tarifa tal como es enviada por el backend.
 * Nota: Los campos de fecha se reciben como strings ISO.
 */
export interface Tarifa {
    id: number;
    nombre: string;
    precio: number;
    fechaInicio: string; // ISO String: Mapeado de Date (backend)
    fechaFin: string; // ISO String: Mapeado de Date (backend)
    descuento?: number; // Descuento opcional (si aplica)
}