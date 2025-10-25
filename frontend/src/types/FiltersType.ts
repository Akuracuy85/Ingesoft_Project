import type { PriceRangeType } from "./PriceRangeType";
import type { LocationType } from "./LocationType";
import type { DateRangeType } from "./DateRangeType";

export type FiltersType = {
  priceRange: PriceRangeType | null;
  location: LocationType;
  categories: string[];
  artists: string[];
  dateRange: DateRangeType;
};