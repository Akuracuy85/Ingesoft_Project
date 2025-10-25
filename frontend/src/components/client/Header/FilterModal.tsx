import { useState } from "react";
import { PriceRangeInput } from "./Filters/PriceRangeInput";
import { LocationSelect } from "./Filters/LocationSelect";
import { MultiSelectDropdown } from "./Filters/MultiSelectDropdown";
import { DateRangePicker } from "./Filters/DateRangePicker";

import type { FiltersType } from "../../../types/FiltersType";
import type { PriceRangeType } from "../../../types/PriceRangeType";
import type { LocationType } from "../../../types/LocationType";
import type { DateRangeType } from "../../../types/DateRangeType";

export const FilterModal = ({
  onClose,
  onApplyFilters,
}: {
  onClose: () => void;
  onApplyFilters: (filters: FiltersType) => void;
}) => {
  const [filters, setFilters] = useState<FiltersType>({
    priceRange: null,
    location: { departamento: null, provincia: null, distrito: null },
    categories: [],
    artists: [],
    dateRange: { start: null, end: null },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative select-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Filtros</h2>

        {/* Precio */}
        <PriceRangeInput
          value={filters.priceRange}
          onChange={(val: PriceRangeType) =>
            setFilters(prev => ({ ...prev, priceRange: val }))
          }
        />

        {/* Ubicación */}
        <LocationSelect
          value={filters.location}
          onChange={(val: LocationType) =>
            setFilters(prev => ({ ...prev, location: val }))
          }
        />

        {/* Categorías */}
        <MultiSelectDropdown
          label="Categoría"
          options={["Rock", "Pop", "Reggaetón", "Salsa", "Jazz"]}
          value={filters.categories}
          onChange={(val: string[]) =>
            setFilters(prev => ({ ...prev, categories: val }))
          }
        />

        {/* Artistas */}
        <MultiSelectDropdown
          label="Artista"
          options={["Bad Bunny", "Ariana Grande", "Coldplay", "Shakira"]}
          value={filters.artists}
          onChange={(val: string[]) =>
            setFilters(prev => ({ ...prev, artists: val }))
          }
        />

        {/* Fecha */}
        <DateRangePicker
          value={filters.dateRange}
          onChange={(val: DateRangeType) =>
            setFilters(prev => ({ ...prev, dateRange: val }))
          }
        />

        <div className="flex justify-end mt-6">
          <button
            onClick={() => onApplyFilters(filters)}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};