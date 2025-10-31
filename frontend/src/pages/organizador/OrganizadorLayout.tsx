import React from "react"; import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import HeaderOrganizador from "../../components/organizador/HeaderOrganizador";
import SidebarOrganizador from "../../components/organizador/SidebarOrganizador";

// --- 1. Tipo estricto de los ítems del menú ---
export type OrganizadorMenuItem =
  | "Gestión de eventos"
  | "Reportes"
  | "Configuración";

// --- 2. Props ---
interface OrganizadorLayoutProps {
  children?: ReactNode; // opcional, porque usaremos <Outlet />
  activeItem: OrganizadorMenuItem;
}

// --- 3. Componente principal ---
const OrganizadorLayout: React.FC<OrganizadorLayoutProps> = ({ children, activeItem }) => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <SidebarOrganizador activeItem={activeItem} />

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1">
        <HeaderOrganizador />

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto p-6 bg-card">
          {/* Si tiene children explícitos los renderiza, sino usa <Outlet /> */}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default OrganizadorLayout;
