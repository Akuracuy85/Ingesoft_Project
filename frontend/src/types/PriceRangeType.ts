// src/types/PriceRangeType.ts

export type PriceRangeType = {
  min: string; // Mejor como string para evitar problemas de formato decimal antes de enviar a BE
  max: string; // Mejor como string para evitar problemas de formato decimal antes de enviar a BE
};