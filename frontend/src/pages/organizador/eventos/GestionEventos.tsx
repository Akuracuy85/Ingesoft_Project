import React, { useState } from "react";
import { Search, Plus, Download } from "lucide-react";
import AdminLayout from "../OrganizadorLayout"; // ✅ importa el layout

import UserTable from "../../../components/admin/UserTable.js";
import UserModal from "../../../components/admin/UserModal.js";

// --- Tipos de usuario ---
type UserRole = "Cliente" | "Organizador" | "Administrador";
type UserStatus = "Activo" | "Inactivo";
type UserID = number;

interface User {
  id: UserID;
  name: string;
  email: string;
  dni: string;
  role: UserRole;
  status: UserStatus;
  lastAccess: string;
}

interface UserFormData {
  name: string;
  email: string;
  dni: string;
  role: UserRole;
  status: UserStatus;
}

type FilterValue = UserRole | UserStatus | "all";

// --- Datos iniciales ---
const initialUsers: User[] = [
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

export default function GestionEventos(): React.ReactElement {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterValue>("all");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.dni && user.dni.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === "all" || user.role === (roleFilter as UserRole);
    const matchesStatus =
      statusFilter === "all" || user.status === (statusFilter as UserStatus);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = (): void => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User): void => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData: UserFormData): void => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)));
    } else {
      const newUser: User = {
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

  const handleToggleStatus = (userId: UserID): void => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "Activo" ? "Inactivo" : "Activo" }
          : u
      )
    );
  };

  const handleDeleteUser = (userId: UserID): void => {
    if (confirm("¿Deseas eliminar este usuario?")) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleExport = (format: string): void => {
    alert(`Exportando lista de usuarios como ${format.toUpperCase()}...`);
  };

  return (
    <AdminLayout activeItem="Usuarios">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border border-border rounded-md px-3 py-2 w-full text-sm"
                />
              </div>
            </div>

            <select
              value={roleFilter}
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

        {/* Tabla */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <UserTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteUser}
          />
        </div>

        {/* Exportar */}
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

        {/* Modal */}
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          user={editingUser}
        />
      </div>
    </AdminLayout>
  );
}
