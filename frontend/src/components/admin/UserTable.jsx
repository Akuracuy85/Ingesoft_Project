import React from "react";
import { Edit, Trash2, Power } from "lucide-react";

export default function UserTable({ users, onEdit, onToggleStatus, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-foreground">ID</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Nombre completo</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Correo</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Rol</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Estado</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Último acceso</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="text-center py-8 text-muted-foreground"
              >
                No se encontraron usuarios
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-4">{user.id}</td>
                <td className="py-3 px-4 font-medium text-foreground">{user.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                <td className="py-3 px-4">{user.role}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      user.status === "Activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {user.lastAccess}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-muted-foreground hover:text-primary"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`${
                        user.status === "Activo"
                          ? "text-red-500 hover:text-red-700"
                          : "text-green-500 hover:text-green-700"
                      }`}
                      title="Activar/Desactivar"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="text-destructive hover:text-red-700"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
