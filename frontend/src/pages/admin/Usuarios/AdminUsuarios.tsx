import React, { useState } from "react";
import { Search, Plus, Download } from "lucide-react";
import AdminLayout from "../AdminLayout";

import UserTable from "../../../components/admin/UserTable";
import UserModal from "../../../components/admin/UserModal";
import { useUsuarios } from "../../../hooks/useUsuarios";
import type { User, UserFormData, UserRole, UserStatus } from "../../../models/User";

export default function AdminUsuarios(): React.ReactElement {
  const { usersQuery, createUser, updateUser, deleteUser, toggleStatus } = useUsuarios();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const users = usersQuery.data ?? [];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.dni && user.dni.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

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
      createUser.mutate(userData);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (userId: number, currentStatus: string): void => {
    toggleStatus.mutate({ id: userId, currentStatus });
  };

  const handleDeleteUser = (userId: number): void => {
    if (confirm("¿Deseas eliminar este usuario?")) {
      deleteUser.mutate(userId);
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
              onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
              className="border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos los roles</option>
              <option value="Cliente">Cliente</option>
              <option value="Organizador">Organizador</option>
              <option value="Administrador">Administrador</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | UserStatus)}
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
              onToggleStatus={(id, status) => handleToggleStatus(id, status)}
              onDelete={handleDeleteUser}
            />
          )}
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
