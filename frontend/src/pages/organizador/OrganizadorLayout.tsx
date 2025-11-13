import React from "react"; import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import HeaderOrganizador from "../../components/organizador/HeaderOrganizador";
import SidebarOrganizador from "../../components/organizador/SidebarOrganizador";

export type OrganizadorMenuItem =
  | "Gestión de eventos"
  | "Reportes"
  | "Configuración";

interface OrganizadorLayoutProps {
  children?: ReactNode; 
  activeItem: OrganizadorMenuItem;
}

const OrganizadorLayout: React.FC<OrganizadorLayoutProps> = ({ children, activeItem }) => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <SidebarOrganizador activeItem={activeItem} />
      <div className="flex flex-col flex-1">
        <HeaderOrganizador />
        <main className="flex-1 overflow-y-auto p-6 bg-card">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default OrganizadorLayout;
