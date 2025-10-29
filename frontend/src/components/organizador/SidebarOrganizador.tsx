import React from "react";
import {
  Calendar,
  Users,
  FileText,
  Settings,
 // 1. Importamos el tipo para los íconos de 'lucide-react'
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
// --- 1. Definición de Tipos para los Datos ---

// Definimos la estructura de un elemento del menú
interface MenuItem {
  name: string;
  icon: LucideIcon; // El icono es de tipo LucideIcon
}

// Menú principal (la constante ahora usa el tipo MenuItem[])
const menuItems: MenuItem[] = [
  { name: "Gestión de eventos", icon: Calendar },
  { name: "Usuarios", icon: Users },
  { name: "Reportes", icon: FileText },
  { name: "Configuración", icon: Settings },
];

// --- 2. Definición de Tipos para las Propiedades (Props) ---

// Definimos la interfaz para las props que recibe el componente
interface SidebarAdminProps {
  // activeItem debe ser el nombre de uno de los elementos del menú
  // Podemos usar un "union type" para restringir los valores válidos:
  activeItem:
    | "Gestión de Eventos"
    | "Reportes"
    | "Configuración";
  // Alternativamente, si no quieres escribir todos los nombres: activeItem: string;
}

// --- 3. Componente con Tipado ---

// Asignamos las props tipadas (SidebarAdminProps) al componente
const SidebarAdmin: React.FC<SidebarAdminProps> = ({ activeItem }) => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-sidebar-foreground">
            Unite
          </span>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-3">
        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Panel Administrativo
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Ya no necesitas 'const Icon = item.icon;' porque TypeScript ya sabe el tipo.
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
}

export default SidebarAdmin;