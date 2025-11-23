// src/components/Header.tsx
import { useState, useCallback } from "react";
import { FilterModal } from "./FilterModal";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Sun, Moon } from "lucide-react";

// Filtros
import { useFilters } from "../../../context/FilterContext";
import { type FiltersType } from "../../../types/FiltersType";

// Logos
import LogoLight from "@/assets/Logo_Unite_Modo_Claro.svg";
import LogoDark from "@/assets/Logo_Unite_Modo_Oscuro.svg";
import ListaIcon from "@/components/ui/icons/ListaIcon";

// Modo oscuro
import { useDarkMode } from "@/hooks/useModoOscuro";

interface HeaderProps {
  showFilterButton?: boolean;
  onApplyNewFilters?: (filters: FiltersType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  showFilterButton = false,
  onApplyNewFilters,
}) => {

  const [showFilters, setShowFilters] = useState(false);

  const { isLoggedIn, user, logout, isLoading } = useAuth();
  const { setFilters, resetFilters } = useFilters();

  const toggleFilters = () => setShowFilters((prev) => !prev);

  const handleLogout = async () => {
    await logout();
  };

  const handleApplyFilters = useCallback(
    (filters: FiltersType) => {
      setFilters(filters);

      if (onApplyNewFilters) {
        onApplyNewFilters(filters);
      }
    },
    [setFilters, onApplyNewFilters]
  );

  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <header
        className="
          fixed top-0 left-0 w-full h-[102px] px-6
          bg-white/90 dark:bg-gray-900/90
          backdrop-blur-md shadow-md
          flex items-center justify-between
          z-50
        "
      >
        {/* LOGO */}
        <div className="flex items-center">
          <Link to="/" onClick={resetFilters}>
            <img
              className="w-[175px] h-[78px] object-contain transition-opacity duration-300"
              alt="Logo Unite"
              src={isDark ? LogoDark : LogoLight}
            />
          </Link>
        </div>

        {/* BOTONES DERECHA */}
        <div className="flex items-center justify-end flex-1 gap-4">

          {/* Botón Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="
              p-2 rounded-full 
              bg-gray-200 dark:bg-gray-700
              hover:scale-110 transition 
              flex items-center justify-center
              cursor-pointer
            "
            title="Cambiar tema"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
          </button>

          {/* Botón Filtros */}
          {showFilterButton && (
            <button
              onClick={toggleFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-[#F6BA26] hover:bg-[#C37723] text-white dark:text-gray-900 transition cursor-pointer"
            >
                  <ListaIcon className="w-5 h-5" />
              <span className="font-medium text-sm">Filtros</span>
            </button>
          )}
          {/* Loading skeleton */}
          {isLoading ? (
            <div className="flex gap-4">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
          ) : isLoggedIn ? (
            <>
              {/* Perfil */}
              <Link
                to="/perfil"
                className="
                  flex items-center gap-2
                  text-gray-700 dark:text-gray-200
                  hover:text-[#C37723] dark:hover:text-[#C37723]
                  transition
                "
              >
                <User className="h-5 w-5" />
                <span className="font-medium text-sm">
                  Hola, {user?.nombre}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-2 px-4 py-2
                  bg-gray-100 dark:bg-gray-700
                  rounded-md text-gray-700 dark:text-gray-200
                  font-medium text-sm
                  hover:bg-gray-200 dark:hover:bg-gray-600
                  transition
                "
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md font-medium text-sm bg-[#F6BA26] hover:bg-[#C37723] text-white dark:text-gray-900 transition cursor-pointer"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/registro"
                className="px-4 py-2 rounded-md font-medium text-sm bg-[#F6BA26] hover:bg-[#C37723] text-white dark:text-gray-900 transition cursor-pointer"
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
