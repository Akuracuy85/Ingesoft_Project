import React, { useState } from "react";
import { Search, Plus, AlertTriangle } from "lucide-react";
import AdminLayout from "../AdminLayout";

import UserTable from "../../../components/admin/UserTable";
import UserModal from "../../../components/admin/UserModal";
import { useUsuarios } from "../../../hooks/useUsuarios";
import { useAuth } from "@/hooks/useAuth";
import type { User, UserFormData, Rol } from "../../../models/User";

import { Navigate, Link } from "react-router-dom";

const DEFAULT_PASSWORD = "unite123";

export default function AdminUsuarios(): React.ReactElement {
  const { user, isLoggedIn, isLoading } = useAuth();
  const REQUIRED_ROLE: Rol = "ADMINISTRADOR"; 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Cargando autenticación...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />; 
  }
  
  // Lógica de Acceso Denegado
  if (user?.rol !== REQUIRED_ROLE) {
    return (
      <AdminLayout activeItem="Usuarios">
        <div className="max-w-xl mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg shadow-md text-center">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">
            Tu cuenta tiene el rol de **{user?.rol ?? 'Usuario'}**. Solo los usuarios con rol **Administrador** pueden acceder a esta sección.
          </p>
          <Link
          to="/login"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out"
        >
          Ir a la página de Login
        </Link>
        </div>
      </AdminLayout>
    );
  }
  
  const { usersQuery, createUser, updateUser, deleteUser, toggleStatus } = useUsuarios();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Rol>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Activo" | "Inactivo">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const users = usersQuery.data ?? [];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellidoPaterno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellidoMaterno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.dni.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || u.rol === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Activo" ? u.activo : !u.activo);

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
      updateUser.mutate({ id: editingUser.id, data: userData });
    } else {
      const newUserDataWithDefaultPassword: UserFormData = {
        ...userData,
        password: DEFAULT_PASSWORD,
      };
      createUser.mutate(newUserDataWithDefaultPassword);
    }
    setIsModalOpen(false);
  };

  // 🧩 Cambia estado (Activo/Inactivo)
  const handleToggleStatus = (userId: number, activoActual: boolean): void => {
    toggleStatus.mutate({ id: userId, currentStatus: activoActual ? "Activo" : "Inactivo" });
  };

  const handleDeleteUser = (userId: number): void => {
    if (confirm("¿Deseas eliminar este usuario?")) {
      deleteUser.mutate(userId);
    }
  };

  return (
    <AdminLayout activeItem="Usuarios">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gestión de usuarios
          </h1>
          <p className="text-muted-foreground">
            Administra las cuentas de clientes, organizadores y administradores del sistema.
          </p>
        </div>

        {/* Filtros */}
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
              onChange={(e) => setRoleFilter(e.target.value as "all" | Rol)}
              className="border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos los roles</option>
              <option value="Cliente">Cliente</option>
              <option value="Organizador">Organizador</option>
              {/* Nota: 'Administrador' aquí debe coincidir con el tipo Rol */}
              <option value="Administrador">Administrador</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "Activo" | "Inactivo")
              }
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
          {usersQuery.isLoading ? (
            <p className="text-center text-muted-foreground py-10">
              Cargando usuarios...
            </p>
          ) : (
            <UserTable
              users={filteredUsers}
              onEdit={handleEditUser}
              onToggleStatus={(id, activo) => handleToggleStatus(id, activo)}
              onDelete={handleDeleteUser}
            />
          )}
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