import type { PriceRangeType } from './PriceRangeType';
import type { LocationType } from './LocationType';
import type { DateRangeType } from './DateRangeType';

export type FiltersType = {
  // Permite que PriceRange sea el objeto con min/max O que sea null si no se usa
  priceRange: PriceRangeType | null;

  // Location siempre debe tener una estructura aunque los campos internos sean nulos/vacíos
  location: LocationType;

  // Listas de IDs/Nombres seleccionados (siempre un array, vacío si no hay selección)
  categories: string[];
  artists: string[];

  dateRange: DateRangeType | null;
};