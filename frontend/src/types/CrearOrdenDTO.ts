// src/types/CrearOrdenDto.ts
export interface CrearOrdenItemDto {
  zonaId: number;
  dnis: string[];
}

export interface CrearOrdenDto {
  eventoId: number;
  items: CrearOrdenItemDto[];
}
