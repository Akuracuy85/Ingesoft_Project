// ./src/types/zone.ts (Tipo que consume la tabla de zonas)
// Importar Tarifa y ZonePurchaseDetail NO es necesario aquí, solo si vas a re-calcular.

import type { Tarifa } from './Tarifa';

export interface Zone {
  id?: number;
  nombre: string;
  capacidad: number;
  cantidadComprada?: number;
  tarifaNormal?: Partial<Tarifa> | null;
  tarifaPreventa?: Partial<Tarifa> | null;
}
// Nota: Usamos Partial<Tarifa> para permitir que la UI maneje solo `precio` y `descuento`.
