// src/types/ZonePurchaseDetail.ts

import { type Tarifa } from "../models/Tarifa"; // Importamos la nueva Tarifa

/**
 * @description Estructura de Zonas que se recibe del backend en el array zonasDisponibles.
 * El campo 'costo' ya no existe; fue reemplazado por las tarifas.
 */
export interface ZonePurchaseDetail {
    id: number;
    nombre: string; // El nombre de la zona
    capacidad: number;
    cantidadComprada: number;
    
    // ✅ Las tarifas explícitas
    tarifaNormal: Tarifa; 
    tarifaPreventa: Tarifa; 
}