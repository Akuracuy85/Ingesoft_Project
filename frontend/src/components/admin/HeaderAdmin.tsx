import React from "react"
import LogoLight from "@/assets/Logo_Unite_Modo_Claro.svg";
import LogoDark from "@/assets/Logo_Unite_Modo_Oscuro.svg";
import { useAuth } from "@/hooks/useAuth"
import Loading from "@/components/common/Loading"
import { useDarkMode } from "@/hooks/useModoOscuro"
import { Moon, Sun } from "lucide-react"

const HeaderAdmin: React.FC = () => {
  const { user, isLoading } = useAuth()
  const userName = user?.nombre || "Administrador"
  const { isDark, toggleDarkMode } = useDarkMode();

  if (isLoading) {
    return <Loading height="h-16" />
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={isDark ? LogoDark : LogoLight} alt="Unite logo" className="w-25 h-25" />
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
          <span className="text-sm text-foreground font-medium">Hola, {userName}</span>
        </div>
      </div>
    </header>
  )
}

export default HeaderAdmin
