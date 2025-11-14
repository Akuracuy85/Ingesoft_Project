import React from "react"
import logo from "../../assets/Logo_Unite.svg"
import { useAuth } from "@/hooks/useAuth"
import Loading from "@/components/common/Loading"

const HeaderAdmin: React.FC = () => {
  const { user, isLoading } = useAuth()
  const userName = user?.nombre || "Administrador"

  if (isLoading) {
    return <Loading height="h-16" />
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="Unite logo" className="w-25 h-25" />
      </div>

      {/* Usuario actual */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground font-medium">Hola, {userName}</span>
      </div>
    </header>
  )
}

export default HeaderAdmin
