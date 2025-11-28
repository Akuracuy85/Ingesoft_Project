import React, { useState, useMemo } from "react";
import { Search, Plus, AlertTriangle } from "lucide-react";
import Loading from '@/components/common/Loading';
import AdminLayout from "../AdminLayout";

import UserTable from "../../../components/admin/UserTable";
import UserModal from "../../../components/admin/UserModal";
import { useUsuarios } from "../../../hooks/useUsuarios";
import { useAuth } from "@/hooks/useAuth";
import type { User, UserFormData, Rol } from "../../../models/User";

import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_PASSWORD = "unite123";

export default function AdminUsuarios(): React.ReactElement {
  const { user, isLoggedIn, isLoading } = useAuth();
  const REQUIRED_ROLE: Rol = "ADMINISTRADOR";
  const { usersQuery, createUser, updateUser, deleteUser, toggleStatus } = useUsuarios();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Rol>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Activo" | "Inactivo">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  if (isLoading) {
    return <Loading fullScreen message={"Cargando autenticación..."} />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

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

  const users = usersQuery.data ?? [];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellidoPaterno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellidoMaterno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.dni.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      u.rol?.toLowerCase() === roleFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Activo" ? u.activo : !u.activo);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPaginas = Math.ceil(filteredUsers.length / itemsPorPagina);

  const usuariosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return filteredUsers.slice(inicio, inicio + itemsPorPagina);
  }, [filteredUsers, paginaActual]);

  const handleCreateUser = (): void => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User): void => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

    const handleSaveUser = (userData: UserFormData): void => {
    const payload: UserFormData = {
      ...userData,
      rol: (userData.rol || "CLIENTE").toUpperCase() as Rol,
      password: editingUser ? userData.password : DEFAULT_PASSWORD,
    };

    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, data: payload });
    } else {
      createUser.mutate(payload);
    }
    setIsModalOpen(false);
  };


  const handleToggleStatus = (userId: number, currentStatus: "Activo" | "Inactivo"): void => {
    toggleStatus.mutate({ id: userId, currentStatus });
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
            {/* Buscador */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Buscar por nombre, correo o DNI"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="pl-10 border border-border rounded-md px-3 py-2 w-full text-sm"
                />
              </div>
            </div>

            {/* Filtro Rol */}
            <Select
              value={roleFilter}
              onValueChange={(val) => {
                setRoleFilter(val as "all" | Rol);
                setPaginaActual(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
                <SelectItem value="Organizador">Organizador</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Estado */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as "all" | "Activo" | "Inactivo");
                setPaginaActual(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            {/* Botón crear */}
            <Button onClick={handleCreateUser} className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              Crear usuario
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {usersQuery.isLoading ? (
            <div className="text-center py-10">
              <Loading />
            </div>
          ) : (
            <UserTable
              users={usuariosPaginados}
              onEdit={handleEditUser}
              onToggleStatus={(id, activo) => handleToggleStatus(id, activo)}
              onDelete={handleDeleteUser}
            />
          )}
        </div>

        {/* PAGINACIÓN */}
        <div className="flex justify-between items-center mt-6 px-2">
          <Button
            variant="outline"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(paginaActual - 1)}
          >
            Anterior
          </Button>

          <p className="text-sm text-muted-foreground">
            Página {paginaActual} de {totalPaginas || 1}
          </p>

          <Button
            variant="outline"
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() => setPaginaActual(paginaActual + 1)}
          >
            Siguiente
          </Button>
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
