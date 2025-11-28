import React from "react"
import { Edit, Power } from "lucide-react"
import type { User } from "../../models/User"

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onToggleStatus: (userId: number, currentStatus: "Activo" | "Inactivo") => void
  onDelete: (userId: number) => void
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onToggleStatus }) => {
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
            <th className="text-center py-3 px-4 font-semibold text-foreground">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-muted-foreground">
                No se encontraron usuarios
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const estadoTexto = user.activo ? "Activo" : "Inactivo"
              return (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">{user.id}</td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {`${user.nombre} ${user.apellidoPaterno ?? ""} ${user.apellidoMaterno ?? ""}`}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                  <td className="py-3 px-4">{user.rol}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        user.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {estadoTexto}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => onEdit(user)}
                        className="text-gray-600 hover:text-blue-600 transition"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onToggleStatus(user.id, estadoTexto)}
                        className={`${
                          user.activo
                            ? "text-green-600 hover:text-green-800"
                            : "text-red-600 hover:text-red-800"
                        } transition cursor-pointer`}
                        title={
                          user.activo ? "Desactivar usuario" : "Activar usuario"
                        }
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
