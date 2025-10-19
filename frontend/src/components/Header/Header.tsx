import React from "react";

export const Header = () => {
  return (
    <header className="flex items-center justify-between w-full h-[102px] px-6 bg-white shadow-sm">
      {/* Logo */}
      <div className="flex items-center">
        <img
          className="w-[175px] h-[78px] object-contain"
          alt="Logo Unite"
          src="https://c.animaapp.com/mgx1kaihbC7QfN/img/logo-unite-actualizado-1.svg"
        />
      </div>

      {/* Contenedor principal para los botones */}
      <div className="flex items-center justify-end flex-1 gap-3">
        {/* Botón Filtros posicionado más a la izquierda */}
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition mr-20">
          {/* ↑ mr-auto empuja este botón hacia la izquierda */}
          <img
            className="w-5 h-5"
            alt="List icon"
            src="https://c.animaapp.com/mgx1kaihbC7QfN/img/list.svg"
          />
          <span className="font-medium text-sm">Filtros</span>
        </button>

        {/* Botones de autenticación (se mantienen a la derecha) */}
        <button className="px-4 py-2 bg-indigo-600 rounded-md text-white font-medium text-sm hover:bg-indigo-700 transition">
          Iniciar sesión
        </button>
        <button className="px-4 py-2 bg-indigo-600 rounded-md text-white font-medium text-sm hover:bg-indigo-700 transition">
          Registrarse
        </button>
      </div>
    </header>
  );
};