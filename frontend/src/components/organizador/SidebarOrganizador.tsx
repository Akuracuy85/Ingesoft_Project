import React from "react";
import { Calendar, FileText, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  name: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { name: "Gestión de eventos", icon: Calendar },
  { name: "Reportes", icon: FileText },
  { name: "Configuración", icon: Settings },
];

interface SidebarOrganizadorProps {
  activeItem: "Gestión de eventos" | "Reportes" | "Configuración";
}

const SidebarOrganizador: React.FC<SidebarOrganizadorProps> = ({ activeItem }) => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-sidebar-foreground">Unite</span>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-3">
        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Panel Administrativo
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.name === activeItem;
            return (
              <li key={item.name}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarOrganizador;