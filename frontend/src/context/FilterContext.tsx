// src/context/FilterContext.tsx (CORREGIDO Y FINAL)

import React, { createContext, useState, useContext, type ReactNode, useMemo } from 'react';
import type { FiltersType } from '../types/FiltersType';
import type { LocationType } from '../types/LocationType';
// NO importamos DateRangeType ni PriceRangeType aquí, ya que el valor inicial será null

// --- VALORES INICIALES CORREGIDOS ---
// 🛑 IMPORTANTE: Si el componente PriceRangeInput espera 'null' para mostrar guiones,
// debemos inicializar priceRange y dateRange como 'null' directamente.
export const initialFilters: FiltersType = {
  priceRange: null, // 🛑 CORREGIDO: Inicializar como null para indicar "vacío"
  location: { departamento: null, provincia: null, distrito: null } as LocationType,
  categories: [],
  artists: [],
  dateRange: null, // 🛑 CORREGIDO: Inicializar como null para indicar "vacío"
};

// --- INTERFAZ DEL CONTEXTO ---
interface FilterContextType {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  resetFilters: () => void;
}

// 1. Crear el Contexto
export const FilterContext = createContext<FilterContextType | undefined>(undefined);

// 2. Custom Hook para facilitar el uso
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters debe usarse dentro de un FilterProvider.');
  }
  return context;
};

// 3. Crear el Componente Provider
interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<FiltersType>(initialFilters);

  const resetFilters = () => {
    // Restablece el estado a la configuración inicial
    setFilters(initialFilters);
  };

  const contextValue = useMemo(() => ({
    filters,
    setFilters,
    resetFilters,
  }), [filters]);

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};