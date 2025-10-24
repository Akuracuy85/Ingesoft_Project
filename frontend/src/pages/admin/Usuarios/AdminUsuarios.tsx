import React, { useState } from "react";
// Usaremos "import type" si tu configuración es estricta (como en los errores anteriores)
import HeaderAdmin from "../../../components/admin/HeaderAdmin.js";
import SidebarAdmin from "../../../components/admin/SidebarAdmin.js";
import UserTable from "../../../components/admin/UserTable.js";
import UserModal from "../../../components/admin/UserModal.js";
import { Search, Plus, Download } from "lucide-react";

// --- 1. DEFINICIÓN DE INTERFACES Y TIPOS ---

// Definición para el objeto de usuario (la estructura de 'initialUsers')
type UserRole = 'Cliente' | 'Organizador' | 'Administrador';
type UserStatus = 'Activo' | 'Inactivo';
type UserID = number; // El ID es numérico

interface User {
  id: UserID;
  name: string;
  email: string;
  dni: string;
  role: UserRole;
  status: UserStatus;
  lastAccess: string;
}

// Interfaz para los datos que vienen del formulario (UserModal)
// Es idéntica a User, pero sin 'id' ni 'lastAccess'
interface UserFormData {
  name: string;
  email: string;
  dni: string;
  role: UserRole;
  status: UserStatus;
}

// Tipado para los filtros de rol y estado (incluye 'all')
type FilterValue = UserRole | UserStatus | 'all';


// --- 2. COMPONENTE FUNCIONAL ---

const initialUsers: User[] = [ // Tipamos el array inicial
    {
      id: 1001,
      name: "María López",
      email: "maria@unite.com",
      dni: "12345678A",
      role: "Cliente",
      status: "Activo",
      lastAccess: "02/10/25",
    },
    {
      id: 1002,
      name: "Juan Pérez",
      email: "jperez@unite.com",
      dni: "87654321B",
      role: "Organizador",
      status: "Inactivo",
      lastAccess: "15/09/25",
    },
    {
      id: 1003,
      name: "Ana García",
      email: "ana.garcia@unite.com",
      dni: "45678912C",
      role: "Administrador",
      status: "Activo",
      lastAccess: "05/10/25",
    },
    {
      id: 1004,
      name: "Carlos Ruiz",
      email: "cruiz@unite.com",
      dni: "78912345D",
      role: "Cliente",
      status: "Activo",
      lastAccess: "01/10/25",
    },
    {
      id: 1005,
      name: "Laura Martínez",
      email: "lmartinez@unite.com",
      dni: "32165498E",
      role: "Organizador",
      status: "Activo",
      lastAccess: "04/10/25",
    },
];

// Tipamos todos los estados con sus interfaces o tipos correctos
export default function AdminUsuarios(): React.ReactElement { // o React.FC
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<FilterValue>("all");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // editingUser puede ser un objeto User o null
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Tipamos la función de filtrado para mayor claridad
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.dni && user.dni.toLowerCase().includes(searchQuery.toLowerCase()));

    // Necesitamos hacer un casting a los tipos para que TypeScript sepa que son compatibles
    const matchesRole = roleFilter === "all" || user.role === roleFilter as UserRole;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter as UserStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = (): void => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Tipamos la función para asegurar que recibe un User
  const handleEditUser = (user: User): void => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Tipamos la función para asegurar que recibe los datos del formulario (UserFormData)
  const handleSaveUser = (userData: UserFormData): void => {
    if (editingUser) {
      // Edición de usuario
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u))
      );
    } else {
      // Creación de nuevo usuario
      const newUser: User = { // Tipamos el objeto nuevo
        ...userData,
        id: Math.max(...users.map((u) => u.id)) + 1,
        lastAccess: new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }),
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  // Tipamos la función para asegurar que recibe un ID
  const handleToggleStatus = (userId: UserID): void => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "Activo" ? "Inactivo" : "Activo" }
          : u
      )
    );
  };

  // Tipamos la función para asegurar que recibe un ID
  const handleDeleteUser = (userId: UserID): void => {
    if (confirm("¿Deseas eliminar este usuario?")) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleExport = (format: string): void => {
    alert(`Exportando lista de usuarios como ${format.toUpperCase()}...`);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Las props de SidebarAdmin ya fueron tipadas en un ejemplo anterior */}
      <SidebarAdmin activeItem="Usuarios" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Gestión de usuarios
              </h1>
              <p className="text-muted-foreground">
                Administra las cuentas de clientes, organizadores y administradores del sistema.
              </p>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-card rounded-lg border border-border p-6 mb-6 shadow-sm">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Buscar por nombre, correo o DNI"
                      value={searchQuery}
                      // El evento onChange es inferido por TypeScript
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border border-border rounded-md px-3 py-2 w-full text-sm"
                    />
                  </div>
                </div>

                <select
                  value={roleFilter}
                  // Aseguramos que el valor del select coincide con nuestro FilterValue
                  onChange={(e) => setRoleFilter(e.target.value as FilterValue)}
                  className="border border-border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos los roles</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Organizador">Organizador</option>
                  <option value="Administrador">Administrador</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterValue)}
                  className="border border-border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>

                <button
                  onClick={handleCreateUser}
                  className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Crear usuario
                </button>
              </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <UserTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteUser}
              />
            </div>

            {/* Botones de exportación */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleExport("csv")}
                className="border border-border text-muted-foreground rounded-md px-4 py-2 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="border border-border text-muted-foreground rounded-md px-4 py-2 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Las props de UserModal también han sido tipadas */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        // Pasamos el estado tipado
        user={editingUser} 
      />
    </div>
  );
}