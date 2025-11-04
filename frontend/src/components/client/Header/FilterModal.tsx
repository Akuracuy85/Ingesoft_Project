import { useState } from "react";
// Importaciones de sub-componentes
import { PriceRangeInput } from "./Filters/PriceRangeInput";
import { LocationSelect } from "./Filters/LocationSelect";
import { MultiSelectDropdown } from "./Filters/MultiSelectDropdown";
import { DateRangePicker } from "./Filters/DateRangePicker";

// Importación del hook de metadatos para las opciones dinámicas
import { useMetadata } from '../../../hooks/useMetadata'; 

// Importación de tipos
import type { FiltersType } from "../../../types/FiltersType";
import type { PriceRangeType } from "../../../types/PriceRangeType";
import type { LocationType } from "../../../types/LocationType";
import type { DateRangeType } from "../../../types/DateRangeType";
import { useFilters } from "../../../context/FilterContext";

export const FilterModal = ({
  onClose,
  onApplyFilters,
}: {
  onClose: () => void;
  onApplyFilters: (filters: FiltersType) => void;
}) => {
    // 🛑 1. CARGA DE METADATOS: Obtener las opciones dinámicas
    const { categorias, artistas, departamentos, isLoadingMetadata } = useMetadata();
    
    // Obtener los filtros actuales del contexto para inicializar el estado local
    const { filters: currentContextFilters } = useFilters();
    
    // 2. ESTADO LOCAL: Inicializar el estado local del modal con los valores del contexto
    const [filters, setFilters] = useState<FiltersType>(currentContextFilters);

    // Opcional: Mostrar estado de carga
    if (isLoadingMetadata) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="text-white text-lg">Cargando opciones de filtro...</div>
            </div>
        );
    }
    
    // Mapeamos los objetos {id, nombre} a un array de nombres para los Dropdowns
    const categoriaOptions = categorias.map(c => c.nombre);
    const artistaOptions = artistas.map(a => a.nombre);

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
            // 🛑 DATO DINÁMICO: Pasamos la lista de departamentos al selector
            departamentoOptions={departamentos}
            onChange={(val: LocationType) =>
              setFilters(prev => ({ ...prev, location: val }))
            }
          />

          {/* Categorías */}
          <MultiSelectDropdown
            label="Categoría"
            options={categoriaOptions} // 🛑 DATO DINÁMICO
            value={filters.categories}
            onChange={(val: string[]) =>
              setFilters(prev => ({ ...prev, categories: val }))
            }
          />

          {/* Artistas */}
          <MultiSelectDropdown
            label="Artista"
            options={artistaOptions} // 🛑 DATO DINÁMICO
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