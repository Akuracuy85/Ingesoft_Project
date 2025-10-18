import React from "react";
import HeaderAdmin from "../../components/admin/HeaderAdmin.jsx";
import SidebarAdmin from "../../components/admin/SidebarAdmin.jsx";

export default function AdminLayout({ children, activeItem }) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
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
