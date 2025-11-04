// src/types/DateRangeType.ts (CORREGIDO)

export type DateRangeType = {
    // 🛑 CLAVE: Cambiar string | null por Date | null
    start: Date | null; 
    end: Date | null; 
};