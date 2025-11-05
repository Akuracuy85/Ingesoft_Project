// src/types/PriceRangeType.ts (CORREGIDO)

export type PriceRangeType = {
    // 🛑 Permitir string (input de texto) O null (estado inicial/vacío)
    min: string | null; 
    max: string | null; 
};