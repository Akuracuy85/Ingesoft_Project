// src/types/EventoBasicoDto.ts
import type { EstadoEvento } from './EstadoEvento';

export interface EventoBasicoDto {
  nombre: string;
  fecha: string | Date;
  estado: EstadoEvento;
}

