// src/components/Header.tsx

import React, { useState, useCallback, useEffect } from "react";
import { FilterModal } from "./FilterModal";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut } from "lucide-react";
import { useFilters } from '../../../context/FilterContext';
import { type FiltersType } from "../../../types/FiltersType";
import { Sun, Moon } from "lucide-react";
import LogoLight from "@/assets/Logo_Unite_Modo_Claro.svg";
import LogoDark from "@/assets/Logo_Unite_Modo_Oscuro.svg";
interface HeaderProps {
  showFilterButton?: boolean;
  onApplyNewFilters?: (filters: FiltersType) => void;
}

export const Header: React.FC<HeaderProps> = ({ showFilterButton = false, onApplyNewFilters }) => {
  const [showFilters, setShowFilters] = useState(false);

  const { isLoggedIn, user, logout, isLoading } = useAuth();

  const { setFilters, resetFilters } = useFilters();

  const toggleFilters = () => setShowFilters((prev) => !prev);

  const handleLogout = async () => {
    await logout();
  };

  const handleApplyFilters = useCallback((filters: FiltersType) => {
    setFilters(filters);

    if (onApplyNewFilters) {
      onApplyNewFilters(filters);
    }
  }, [setFilters, onApplyNewFilters]);

  const [isDark, setIsDark] = useState(() => {
  return document.documentElement.classList.contains("dark");
});

const toggleDarkMode = () => {
  const html = document.documentElement;

  if (html.classList.contains("dark")) {
    html.classList.remove("dark");
    setIsDark(false);
    localStorage.setItem("theme", "light");
  } else {
    html.classList.add("dark");
    setIsDark(true);
    localStorage.setItem("theme", "dark");
  }
};

// Mantener tema al recargar
useEffect(() => {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
    setIsDark(true);
  }
}, []);

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <header className="
        fixed top-0 left-0 w-full h-[102px] px-6 
        bg-white/90 dark:bg-gray-900/90 
        backdrop-blur-md shadow-md 
        flex items-center justify-between 
        z-50 transition-colors
      ">

        {/* LOGO */}
        <div className="flex items-center">
          <Link
            to="/"
            // Llamar a resetFilters ANTES de navegar a "/"
            onClick={resetFilters}
          >
<img
  className="w-[175px] h-[78px] object-contain transition-opacity duration-300"
  alt="Logo Unite"
  src={isDark ? LogoDark : LogoLight}
/>

          </Link>
        </div>

        {/* BOTONES DERECHA */}
        <div className="flex items-center justify-end flex-1 gap-4">

          {showFilterButton && (
            <button
              onClick={toggleFilters}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition"
            >
              <img
                className="w-5 h-5"
                alt="List icon"
                src="https://c.animaapp.com/mgx1kaihbC7QfN/img/list.svg"
              />
              <span className="font-medium text-sm">Filtros</span>
            </button>
          )}

          {/* Botón Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition flex items-center justify-center"
            title="Cambiar tema"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
          </button>


          {/* ... Lógica de Auth ... */}
          {isLoading ? (
            <div className="flex gap-4">
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
            </div>
          ) : isLoggedIn ? (
            <>
              <Link
                to="/perfil"
                className="flex items-center gap-2 
                  text-gray-700 dark:text-gray-200 
                  hover:text-indigo-600 dark:hover:text-indigo-400 
                  transition"
              >
                <User className="h-5 w-5" />
                <span className="font-medium text-sm">
                  Hola, {user?.nombre}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-medium text-sm hover:bg-gray-200 transition"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 rounded-md text-white font-medium text-sm hover:bg-indigo-700 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="px-4 py-2 bg-indigo-600 rounded-md text-white font-medium text-sm hover:bg-indigo-700 transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </header>

      {/* MODAL DE FILTROS */}
      {showFilterButton && showFilters && (
        <FilterModal
          onClose={toggleFilters}
          onApplyFilters={handleApplyFilters}
        />
      )}
    </>
  );
};