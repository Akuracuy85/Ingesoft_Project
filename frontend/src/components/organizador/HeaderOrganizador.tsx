import React from "react";
import userIcon from "../../assets/Header_UserIcon.svg";
import { useDarkMode } from "@/hooks/useModoOscuro";
import { Moon, Sun } from "lucide-react";

import LogoLight from "@/assets/Logo_Unite_Modo_Claro.svg";
import LogoDark from "@/assets/Logo_Unite_Modo_Oscuro.svg";

// 1. Definimos el tipo para el componente. 
// 'React.FC' (Functional Component) se usa para componentes que no tienen props o que tienen props bien definidas.
const HeaderOrganizador: React.FC = () => {

  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
      {/* Logo y nombre */}
      <div className="flex items-center gap-2">
        <img src={isDark ? LogoDark : LogoLight} alt="Unite logo" className="w-25 h-25" />
        <span className="font-semibold text-foreground"></span>
      </div>

      {/* Usuario actual */}
      <div className="flex">
        <button
          onClick={toggleDarkMode}
          className="
            p-2 rounded-full
            bg-gray-200 dark:bg-gray-700
            hover:scale-110 transition 
            flex items-center justify-center
            cursor-pointer mr-4
          "
          title="Cambiar tema"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-800" />
          )}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground font-medium">Organizador</span>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            <img
              src={userIcon}
              alt="Organizador avatar"
              className="object-cover h-full w-full"
              />
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderOrganizador;