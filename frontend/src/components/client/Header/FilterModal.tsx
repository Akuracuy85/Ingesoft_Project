// src/components/FilterModal.tsx (CORREGIDO - Hooks Movidos al Inicio)

import { useState, useEffect, useMemo, useCallback } from "react"; 
// Importaciones de sub-componentes
import { PriceRangeInput } from "./Filters/PriceRangeInput";
import { LocationSelect } from "./Filters/LocationSelect";
import { MultiSelectDropdown, type MultiOption } from "./Filters/MultiSelectDropdown";
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
    // 🛑 TODOS LOS HOOKS (useState, useMetadata, useFilters) DEBEN IR PRIMERO
    const { categorias, artistas, departamentos, isLoadingMetadata } = useMetadata();
    const { filters: currentContextFilters } = useFilters();
    const [filters, setFilters] = useState<FiltersType>(currentContextFilters);
    
// 🛑 AGREGAR ESTO: Verifica que haya artistas antes de intentar acceder a [0]
if (artistas.length > 0) {
    console.log("Estructura de Artista (DEBUG):", artistas[0]);
}

    // -------------------------------------------------------------
    // LÓGICA DE FILTRADO Y HOOKS CALCULADOS (useMemo, useEffect, useCallback)
    // -------------------------------------------------------------

    // 1. Opciones de Categoría
    const categoriaOptions: MultiOption[] = categorias.map(c => ({ 
        id: c.id.toString(),
        nombre: c.nombre
    }));

    // 2. Artistas Filtrados (USA useMemo - Lógica de Cascada)
    const selectedCategoryIds = filters.categories;

    const artistasFiltrados = useMemo(() => {
        if (selectedCategoryIds.length === 0) {
            // Caso: Ninguna categoría seleccionada. Mostrar todos los artistas.
            return artistas;
        }

        // Caso: Filtrar artistas por categoría seleccionada(s).
        return artistas.filter(artista => {
            // Acceso seguro al ID de la categoría del artista
            const artistaCatId = (artista as any).categoriaId || (artista as any).categoria?.id;
            
            // Verificar que el ID existe antes de intentar convertirlo
            if (artistaCatId !== undefined && artistaCatId !== null) {
                return selectedCategoryIds.includes(artistaCatId.toString());
            }
            return false;
        });
    }, [artistas, selectedCategoryIds]);


    // 3. Mapear Artistas Filtrados a opciones de Dropdown
    const artistaOptions: MultiOption[] = artistasFiltrados.map(a => ({
        id: a.id.toString(),
        nombre: a.nombre
    }));

    // 4. Efecto de Deselección Automática (USA useEffect)
    useEffect(() => {
        const validArtistIds = new Set(artistaOptions.map(a => a.id)); 
        const hasInvalidSelection = filters.artists.some(id => !validArtistIds.has(id));
        
        if (hasInvalidSelection) {
            const newArtists = filters.artists.filter(id => validArtistIds.has(id));
            
            // Usar setTimeout para deseleccionar después del render
            setTimeout(() => {
                setFilters(prev => ({ ...prev, artists: newArtists }));
            }, 0);
        }
    }, [filters.categories, filters.artists, artistaOptions]);

    // 5. Handlers (usando useCallback para evitar re-creación)
    const handleArtistChange = useCallback((newArtistIds: string[]) => {
        setFilters(prev => ({ ...prev, artists: newArtistIds }));
    }, []); 

    const handleCategoryChange = useCallback((newCategoryIds: string[]) => {
        setFilters(prev => ({ ...prev, categories: newCategoryIds }));
    }, []);
    
    const handlePriceChange = useCallback((val: PriceRangeType) => {
        setFilters(prev => ({ ...prev, priceRange: val }));
    }, []);

    const handleLocationChange = useCallback((val: LocationType) => {
        setFilters(prev => ({ ...prev, location: val }));
    }, []);

    const handleDateChange = useCallback((val: DateRangeType) => {
        setFilters(prev => ({ ...prev, dateRange: val }));
    }, []);


    // -------------------------------------------------------------
    // 🛑 RETURN CONDICIONAL (DEBE IR DESPUÉS DE TODOS LOS HOOKS)
    // -------------------------------------------------------------
    if (isLoadingMetadata) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="text-white text-lg">Cargando opciones de filtro...</div>
            </div>
        );
    }
    
    // -------------------------------------------------------------
    // RENDERIZADO PRINCIPAL
    // -------------------------------------------------------------
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
            onChange={handlePriceChange}
          />

          {/* Ubicación */}
          <LocationSelect
            value={filters.location}
            departamentoOptions={departamentos}
            onChange={handleLocationChange}
          />

          {/* Categorías */}
          <MultiSelectDropdown
            label="Categoría"
            options={categoriaOptions} 
            value={filters.categories}
            onChange={handleCategoryChange}
          />

          {/* Artistas */}
          <MultiSelectDropdown
            label="Artista"
            options={artistaOptions} // Usa la lista filtrada por categoría
            value={filters.artists} 
            onChange={handleArtistChange}
          />

          {/* Fecha */}
          <DateRangePicker
            value={filters.dateRange}
            onChange={handleDateChange}
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