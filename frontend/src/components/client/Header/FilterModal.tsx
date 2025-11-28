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

  const { categorias, artistas, departamentos, isLoadingMetadata } = useMetadata();

  const { filters: currentContextFilters, resetFilters } = useFilters();

  const [filters, setFilters] = useState<FiltersType>(currentContextFilters);


  useEffect(() => {
    setFilters(currentContextFilters);
  }, [currentContextFilters]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
      // Restaurar cualquier valor inline previo (defensivo)
      document.body.style.overflow = prev || '';
    };
  }, []);

  useEffect(() => {
    const wheelHandler = (e: WheelEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.deltaY !== 0) {
        e.preventDefault();
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const k = e.key;
        if (k === '+' || k === '-' || k === '=' || k === '0') {
          e.preventDefault();
        }
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const gestureHandler = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', wheelHandler, { passive: false });
    window.addEventListener('keydown', keyHandler, { passive: false });
    window.addEventListener('touchmove', touchMoveHandler, { passive: false });
    // gesturestart/gesturechange are non-standard but supported on some browsers (iOS)
    window.addEventListener('gesturestart', gestureHandler as EventListener);
    window.addEventListener('gesturechange', gestureHandler as EventListener);

    return () => {
      window.removeEventListener('wheel', wheelHandler as EventListener);
      window.removeEventListener('keydown', keyHandler as EventListener);
      window.removeEventListener('touchmove', touchMoveHandler as EventListener);
      window.removeEventListener('gesturestart', gestureHandler as EventListener);
      window.removeEventListener('gesturechange', gestureHandler as EventListener);
    };
  }, []);


  const categoriaOptions: MultiOption[] = useMemo(() => categorias.map(c => ({
    id: c.id.toString(),
    nombre: c.nombre
  })), [categorias]);


  const selectedCategoryIds = filters.categories;

  const artistasFiltrados = useMemo(() => {
    const allArtistas = Array.isArray(artistas) ? artistas : [];

    if (selectedCategoryIds.length === 0) {
      return [];
    }

    return allArtistas.filter(artista => {
      const artistaCatId = (artista as any).categoriaId || (artista as any).categoria?.id;

      if (artistaCatId !== undefined && artistaCatId !== null) {
        return selectedCategoryIds.includes(artistaCatId.toString());
      }
      return false;
    });
  }, [artistas, selectedCategoryIds]);

  const artistaOptions: MultiOption[] = useMemo(() => artistasFiltrados.map(a => ({
    id: a.id.toString(),
    nombre: a.nombre
  })), [artistasFiltrados]);


  const handleArtistChange = useCallback((newArtistIds: string[]) => {
    setFilters(prev => ({ ...prev, artists: newArtistIds }));
  }, []);

  const handleCategoryChange = useCallback((newCategoryIds: string[]) => {

    const allArtistas = Array.isArray(artistas) ? artistas : [];

    const validArtistIds = allArtistas
      .filter(artista => {
        const artistaCatId = (artista as any).categoriaId || (artista as any).categoria?.id;
        return artistaCatId && newCategoryIds.includes(artistaCatId.toString());
      })
      .map(a => a.id.toString());

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

  const handleApply = () => {
    onApplyFilters(filters);
    onClose(); 
  };

  const handleClear = () => {
    resetFilters(); 
    setFilters(initialFilters); 
  };

  // -------------------------------------------------------------
  // RENDERIZADO
  // -------------------------------------------------------------
  if (isLoadingMetadata) return null;


  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] p-4 sm:p-6 relative select-none mx-4 dark:bg-gray-900 dark:text-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:text-gray-300 dark:hover:text-white cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Filtros</h2>

        {/* Body: responsive 1 / 2 column grid, scrollable area */}
        <div className="min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-h-[66vh] overflow-y-auto pr-2 min-h-0">
            <div className="flex flex-col gap-6 min-w-0">
              <PriceRangeInput value={filters.priceRange} onChange={handlePriceChange} />
              <LocationSelect value={filters.location} departamentoOptions={departamentos} onChange={handleLocationChange} />
              <DateRangePicker value={filters.dateRange} onChange={handleDateChange} />
            </div>

            <div className="flex flex-col gap-6 min-w-0">
              <MultiSelectDropdown label="Categoría" options={categoriaOptions} value={filters.categories} onChange={handleCategoryChange} menuMaxHeight="200px" />
              <MultiSelectDropdown
                label="Artista"
                options={artistaOptions}
                value={filters.artists}
                onChange={handleArtistChange}
                disabled={artistaOptions.length === 0}
                menuMaxHeight="130px"
              />
              {filters.categories.length === 0 && filters.artists.length === 0 && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Necesitas seleccionar una o más categorías para poder elegir a los artistas de dicha categoría.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          {/* BOTÓN DE LIMPIAR (ESTILO NARANJA) */}
          <button
            onClick={handleClear}
            className="text-sm font-medium border border-orange-700 bg-orange-100 text-orange-800 px-4 py-2 rounded hover:bg-orange-200 transition dark:text-orange-200 dark:bg-orange-900/20 dark:border-orange-600 dark:hover:bg-orange-800/20 cursor-pointer"
          >
            Limpiar Filtros
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-sm font-medium text-gray-700 px-4 py-2 rounded hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
            >
              Cancelar
            </button>
            {/* BOTÓN DE ACEPTAR */}
            <button
              onClick={handleApply}
              className="px-6 py-2 rounded-md font-medium text-sm bg-[#F6BA26] hover:bg-[#C37723] text-white dark:text-gray-900 transition cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};