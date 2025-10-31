// src/models/Tarifa.ts

/**
 * @description Estructura de Tarifa tal como es enviada por el backend.
 * Nota: Tu archivo Tarifa.ts estaba vacío, lo definimos aquí con los campos reales.
 */
export interface Tarifa {
    id: number;
    nombre: string;
    precio: number;
    fechaInicio: string; // ISO String
    fechaFin: string; // ISO String
}