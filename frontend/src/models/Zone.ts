// ./src/types/zone.ts (Tipo que consume la tabla de zonas)
// Importar Tarifa y ZonePurchaseDetail NO es necesario aquí, solo si vas a re-calcular.

// ./src/types/zone.ts (Tipo que consume la tabla de zonas)
// Importar Tarifa y ZonePurchaseDetail NO es necesario aquí, solo si vas a re-calcular.
import type { Tarifa } from './Tarifa';

export interface Zone {
  id?: number;
  nombre: string;
  capacidad: number;
  cantidadComprada?: number;
  // Usamos Partial<Tarifa> para permitir campos opcionales desde la UI,
  // y mantener compatibilidad con el modelo backend `Tarifa`.
  tarifaNormal?: Partial<Tarifa> | null;
  tarifaPreventa?: Partial<Tarifa> | null;
}
// Nota: `tarifaNormal` y `tarifaPreventa` aquí son Partial<Tarifa> para que la UI pueda
// trabajar con solo `precio`/`descuento`. Si el backend requiere la estructura completa,
// mapear antes de enviarla.
