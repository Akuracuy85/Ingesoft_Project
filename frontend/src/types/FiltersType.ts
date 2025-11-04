// src/types/FiltersType.ts

import type { PriceRangeType } from "./PriceRangeType";
import type { LocationType } from "./LocationType";
import type { DateRangeType } from "./DateRangeType";

export type FiltersType = {
  priceRange: PriceRangeType | null;
  location: LocationType;
  categories: string[]; // Asume nombres o IDs para enviar al BE
  artists: string[];      // Asume nombres o IDs para enviar al BE
  dateRange: DateRangeType;
};