// src/models/Zone.ts (CORRECCIÓN FINAL)

import type { Tarifa } from "./Tarifa";

export interface Zone {
    id: number;
    nombre: string;
    capacidad: number;
    cantidadComprada: number;
    
    // ✅ Campo obligatorio: Mapeado de tarifaNormal
    tarifaNormal: Tarifa; 
    
    // 🛑 CORRECCIÓN: Usamos '?' para hacerlo opcional y permitimos 'null'
    // Esto significa que la propiedad puede estar ausente (undefined) o presente con valor (Tarifa | null)
    tarifaPreventa?: Tarifa | null; 
}