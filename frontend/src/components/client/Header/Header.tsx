// src/components/Header.tsx
import React, { useState } from "react";
import { FilterModal } from "./FilterModal"; // Asumo que este componente existe
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // <-- ¡TU HOOK CORREGIDO!
// Asegúrate de tener 'lucide-react' instalado o usa tus propios íconos
import { User, LogOut } from "lucide-react"; 

interface HeaderProps {
  showFilterButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showFilterButton = false }) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // --- 1. USA EL CONTEXTO DE AUTENTICACIÓN ---
  // Ahora 'isLoggedIn', 'user', 'logout' y 'isLoading' vienen del estado global
  const { isLoggedIn, user, logout, isLoading } = useAuth();

  const toggleFilters = () => setShowFilters((prev) => !prev);

  // Función para manejar el logout
  const handleLogout = async () => {
    await logout();
    // No necesitas redirigir, el estado cambiará
    // y el header se re-renderizará solo.
  };

  return (
    <>
      {/* 🔹 HEADER PRINCIPAL */}
      <header className="fixed top-0 left-0 w-full h-[102px] px-6 bg-white/90 backdrop-blur-md shadow-md flex items-center justify-between z-50">
        {/* LOGO */}
        <div className="flex items-center">
          {/* Es buena idea enlazar el logo al home */}
          <Link to="/"> 
            <img
              className="w-[175px] h-[78px] object-contain"
              alt="Logo Unite"
              src="https://c.animaapp.com/mgx1kaihbC7QfN/img/logo-unite-actualizado-1.svg"
            />
          </Link>
        </div>

        {/* 🔸 BOTONES DERECHA */}
        <div className="flex items-center justify-end flex-1 gap-4">
          
          {/* BOTÓN DE FILTROS (Condicional - Tu lógica existente) */}
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

          {/* --- 2. RENDERIZADO CONDICIONAL DE AUTH --- */}
          {isLoading ? (
            // Muestra un 'esqueleto' mientras verifica la sesión
            <div className="flex gap-4">
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
            </div>
          ) : isLoggedIn ? (
            // 3. Si ESTÁ logueado
            <>
              <Link 
                to="/perfil" // Asume que tienes una ruta de perfil
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition"
              >
                <User className="h-5 w-5" />
                <span className="font-medium text-sm">
                  {/* ¡Muestra el nombre del usuario! */}
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
            // 4. Si NO ESTÁ logueado
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
          {/* --- FIN DEL RENDERIZADO CONDICIONAL --- */}

        </div>
      </header>

      {/* MODAL DE FILTROS (Tu lógica existente) */}
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

