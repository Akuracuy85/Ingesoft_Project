import React from "react";
import type { ReactNode } from "react"; // Solución al error de ReactNode

import HeaderAdmin from "../../components/admin/HeaderAdmin.js";
import SidebarAdmin from "../../components/admin/SidebarAdmin.js";

// --- 1. Definición del Tipo Estricto de Menú ---

// Copia el Union Type EXACTO de tu SidebarAdminProps:
type AdminMenuItem = 
    | "Gestión de eventos" 
    | "Usuarios" 
    | "Reportes" 
    | "Configuración";

// --- 2. INTERFAZ PARA LAS PROPIEDADES (PROPS) ---

interface AdminLayoutProps {
  children: ReactNode; 
  
  // ¡CORRECCIÓN! Usamos el tipo estricto de menú.
  activeItem: AdminMenuItem; 
}

// --- 3. COMPONENTE CON TIPADO ---

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeItem }) => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* AQUÍ: Ahora activeItem es de tipo AdminMenuItem, 
        que es compatible con lo que espera SidebarAdmin.
      */}
      <SidebarAdmin activeItem={activeItem} />

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <HeaderAdmin />

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto p-6 bg-card">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;