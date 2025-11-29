// src/models/Zone.ts (CORRECCIÓN FINAL)

import type { Tarifa } from "./Tarifa";

export interface Zone {
    id?: number;
    nombre: string;
    capacidad: number;
    cantidadComprada: number;
    
    // Campo obligatorio: Mapeado de tarifaNormal
    tarifaNormal: Tarifa; 
    
    // Usamos '?' para hacerlo opcional y permitimos 'null'
    tarifaPreventa?: Tarifa | null; 
}