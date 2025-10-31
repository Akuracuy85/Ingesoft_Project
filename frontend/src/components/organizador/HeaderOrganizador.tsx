import React from "react";
import userIcon from "../../assets/Header_UserIcon.svg";
import logo from "../../assets/Logo_Unite.svg";

// 1. Definimos el tipo para el componente. 
// 'React.FC' (Functional Component) se usa para componentes que no tienen props o que tienen props bien definidas.
const HeaderOrganizador: React.FC = () => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
      {/* Logo y nombre */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="Unite logo" className="w-25 h-25" />
        <span className="font-semibold text-foreground"></span>
      </div>

      {/* Usuario actual */}
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
    </header>
  );
}

export default HeaderOrganizador;