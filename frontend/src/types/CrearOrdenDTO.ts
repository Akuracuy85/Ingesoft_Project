// src/types/CrearOrdenDto.ts (O donde lo tengas definido)

export interface CrearOrdenItemDto {
  zonaId: number;
  dnis: string[];
}

export interface CrearOrdenDto {
  eventoId: number;
  items: CrearOrdenItemDto[];
  
  // 🛑 AÑADIDOS: Campos para la lógica de puntos
  tipoCompra: 'normal' | 'preferencial';
  puntosImpacto: number; // El total de puntos (calculado en el frontend)
}