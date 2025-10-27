import React from "react"; import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import HeaderAdmin from "../../components/admin/HeaderAdmin.js";
import SidebarAdmin from "../../components/admin/SidebarAdmin.js";

// --- 1. Tipo estricto de los ítems del menú ---
export type AdminMenuItem =
  | "Gestión de eventos"
  | "Usuarios"
  | "Reportes"
  | "Configuración";

// --- 2. Props ---
interface AdminLayoutProps {
  children?: ReactNode; // opcional, porque usaremos <Outlet />
  activeItem: AdminMenuItem;
}

// --- 3. Componente principal ---
const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeItem }) => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <SidebarAdmin activeItem={activeItem} />

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1">
        <HeaderAdmin />

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto p-6 bg-card">
          {/* Si tiene children explícitos los renderiza, sino usa <Outlet /> */}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
