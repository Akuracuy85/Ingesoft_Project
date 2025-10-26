import React, { useState } from "react";
import { FilterModal } from "./FilterModal";

// --- 1. Definimos una interfaz para las 'props' ---
// Haremos que el Header pueda recibir una propiedad opcional
interface HeaderProps {
  showFilterButton?: boolean; // '?' significa que es opcional
}

// --- 2. Cambiamos la firma del componente ---
// Recibimos la prop 'showFilterButton' y le damos un valor por defecto de 'false'
export const Header: React.FC<HeaderProps> = ({ showFilterButton = false }) => {
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => setShowFilters((prev) => !prev);

  return (
    <>
      {/* 🔹 HEADER PRINCIPAL */}
      <header className="flex items-center justify-between w-full h-[102px] px-6 bg-white shadow-sm relative z-50">
        {/* LOGO */}
        <div className="flex items-center">
          <img
            className="w-[175px] h-[78px] object-contain"
            alt="Logo Unite"
            src="https://c.animaapp.com/mgx1kaihbC7QfN/img/logo-unite-actualizado-1.svg"
          />
        </div>

        {/* 🔸 BOTONES DERECHA */}
        <div className="flex items-center justify-end flex-1 gap-3">
          
          {/* --- 3. Renderizado Condicional --- */}
          {/* El botón SÓLO se muestra si showFilterButton es true */}
          {showFilterButton && (
            <button
              onClick={toggleFilters}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition mr-20"
            >
              <img
                className="w-5 h-5"
                alt="List icon"
                src="https://c.animaapp.com/mgx1kaihbC7QfN/img/list.svg"
              />
              <span className="font-medium text-sm">Filtros</span>
            </button>
          )}

          {/* BOTONES DE AUTENTICACIÓN (Estos siempre se muestran) */}
          <button className="px-4 py-2 bg-indigo-600 rounded-md text-white font-medium text-sm hover:bg-indigo-700 transition">
            Iniciar sesión
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-md text-white font-medium text-sm hover:bg-indigo-700 transition">
            Registrarse
          </button>
        </div>
      </header>

      {/* --- 4. El Modal también es condicional --- */}
      {/* Solo se puede mostrar el modal si el botón existe Y el estado es true */}
      {showFilterButton && showFilters && (
        <FilterModal
          onClose={toggleFilters}
          onApplyFilters={(filters) => {
            console.log("🎯 Filtros aplicados:", filters);
            toggleFilters();
          }}
        />
      )}
    </>
  );
};