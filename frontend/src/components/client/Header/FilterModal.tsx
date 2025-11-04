// src/components/FilterModal.tsx (VERSIÓN FINAL)

import { useState, useEffect, useMemo, useCallback } from "react"; 
import { PriceRangeInput } from "./Filters/PriceRangeInput"; 
import { LocationSelect } from "./Filters/LocationSelect";
import { MultiSelectDropdown, type MultiOption } from "./Filters/MultiSelectDropdown"; 
import { DateRangePicker } from "./Filters/DateRangePicker";

import { useMetadata } from '../../../hooks/useMetadata'; 
import type { FiltersType } from "../../../types/FiltersType";
import type { PriceRangeType } from "../../../types/PriceRangeType";
import type { LocationType } from "../../../types/LocationType";
import type { DateRangeType } from "../../../types/DateRangeType";
import { useFilters, initialFilters } from "../../../context/FilterContext"; 


export const FilterModal = ({
  onClose,
  onApplyFilters,
}: {
  onClose: () => void;
  onApplyFilters: (filters: FiltersType) => void;
}) => {
    // HOOKS
    const { categorias, artistas, departamentos, isLoadingMetadata } = useMetadata();
    // OBTENER EL ESTADO GLOBAL PERSISTENTE Y LA FUNCIÓN DE LIMPIEZA
    const { filters: currentContextFilters, resetFilters } = useFilters();
    
    // ESTADO LOCAL: Inicializado con el estado global persistente
    const [filters, setFilters] = useState<FiltersType>(currentContextFilters);
    
    // EFECTO DE SINCRONIZACIÓN
    useEffect(() => {
        setFilters(currentContextFilters);
    }, [currentContextFilters]); 
    
    // -------------------------------------------------------------
    // LÓGICA DE FILTRADO Y HOOKS CALCULADOS
    // -------------------------------------------------------------

    // 1. Opciones de Categoría
    const categoriaOptions: MultiOption[] = useMemo(() => categorias.map(c => ({ 
        id: c.id.toString(),
        nombre: c.nombre
    })), [categorias]);

    // 2. Artistas Filtrados (Lógica de Cascada Estricta)
    const selectedCategoryIds = filters.categories;

    const artistasFiltrados = useMemo(() => {
        const allArtistas = Array.isArray(artistas) ? artistas : [];
        
        // Bloqueo estricto: Si no hay categorías seleccionadas, no hay opciones.
        if (selectedCategoryIds.length === 0) {
            return []; 
        }

        // Muestra solo los artistas cuyas categorías están actualmente seleccionadas.
        return allArtistas.filter(artista => {
            const artistaCatId = (artista as any).categoriaId || (artista as any).categoria?.id;
            
            if (artistaCatId !== undefined && artistaCatId !== null) {
                return selectedCategoryIds.includes(artistaCatId.toString());
            }
            return false;
        });
    }, [artistas, selectedCategoryIds]);

    // 3. Mapear Artistas Filtrados a opciones de Dropdown
    const artistaOptions: MultiOption[] = useMemo(() => artistasFiltrados.map(a => ({
        id: a.id.toString(),
        nombre: a.nombre
    })), [artistasFiltrados]); 

    
    // -------------------------------------------------------------
    // HANDLERS DE CAMBIO DE FILTRO
    // -------------------------------------------------------------
    
    const handleArtistChange = useCallback((newArtistIds: string[]) => {
        setFilters(prev => ({ ...prev, artists: newArtistIds }));
    }, []); 

    // HANDLER que limpia artistas al cambiar categorías.
    const handleCategoryChange = useCallback((newCategoryIds: string[]) => {
    
        const allArtistas = Array.isArray(artistas) ? artistas : [];
        
        // 1. IDs de artista que son válidos para las NUEVAS categorías.
        const validArtistIds = allArtistas
            .filter(artista => {
                const artistaCatId = (artista as any).categoriaId || (artista as any).categoria?.id;
                return artistaCatId && newCategoryIds.includes(artistaCatId.toString());
            })
            .map(a => a.id.toString());

        // 2. Actualizar categorías y limpiar artistas inválidos.
        setFilters(prev => {
            
            const artistsToKeep = prev.artists.filter(artistId => 
                validArtistIds.includes(artistId)
            );

            return { 
                ...prev, 
                categories: newCategoryIds,
                artists: artistsToKeep,
            };
        });
    }, [artistas]); 
    
    const handlePriceChange = useCallback((val: PriceRangeType | null) => {
        setFilters(prev => ({ ...prev, priceRange: val }));
    }, []);

    const handleLocationChange = useCallback((val: LocationType) => {
        setFilters(prev => ({ ...prev, location: val }));
    }, []);

    const handleDateChange = useCallback((val: DateRangeType | null) => {
        setFilters(prev => ({ ...prev, dateRange: val }));
    }, []);

    // -------------------------------------------------------------
    // HANDLERS DE APLICAR Y LIMPIAR EL MODAL
    // -------------------------------------------------------------
    
    // Handler para aplicar los filtros y cerrar
    const handleApply = () => {
        onApplyFilters(filters); 
        onClose(); // Cierra el modal
    };

    // Handler para limpiar los filtros (usa el contexto para resetear el estado global)
    const handleClear = () => {
        resetFilters(); // Restablece el estado global (Context)
        setFilters(initialFilters); // Restablece el estado local
    };

    // -------------------------------------------------------------
    // RENDERIZADO
    // -------------------------------------------------------------
    if (isLoadingMetadata) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="text-white text-lg">Cargando opciones de filtro...</div>
            </div>
        );
    }
    
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

          {/* Controles de filtro... */}
          <PriceRangeInput value={filters.priceRange} onChange={handlePriceChange} />
          <LocationSelect value={filters.location} departamentoOptions={departamentos} onChange={handleLocationChange} />
          <MultiSelectDropdown label="Categoría" options={categoriaOptions} value={filters.categories} onChange={handleCategoryChange} />
          <MultiSelectDropdown 
                label="Artista" 
                options={artistaOptions} 
                value={filters.artists} 
                onChange={handleArtistChange} 
                disabled={artistaOptions.length === 0}
            />
          <DateRangePicker value={filters.dateRange} onChange={handleDateChange} />

          <div className="flex justify-between mt-6 border-t pt-4">
                {/* BOTÓN DE LIMPIAR (ESTILO NARANJA) */}
                <button
                    onClick={handleClear}
                    className="text-sm font-medium border border-orange-700 bg-orange-100 text-orange-800 px-4 py-2 rounded hover:bg-orange-200 transition"
                >
                    Limpiar Filtros
                </button>
                
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="text-sm font-medium text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                    {/* BOTÓN DE ACEPTAR */}
                    <button
                        onClick={handleApply}
                        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                    >
                        Aceptar
                    </button>
                </div>
          </div>
        </div>
        
      </div>
    );
};