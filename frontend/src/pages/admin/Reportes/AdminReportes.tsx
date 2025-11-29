import React from "react"
import { Navigate, Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import type { Rol } from "@/models/User"
import { AlertTriangle } from "lucide-react"
import Loading from '@/components/common/Loading'

import AdminLayout from "../AdminLayout"
import { ReporteVentas } from "@/components/admin/ReporteVentas"
import { ReporteAcciones } from "@/components/admin/ReporteAcciones"

export default function AdminReportes(): React.ReactElement {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const REQUIRED_ROLE: Rol = "ADMINISTRADOR"
  if (isAuthLoading) {
    return <Loading fullScreen message={"Cargando autenticación..."} />
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (user?.rol !== REQUIRED_ROLE) {
    return (
      <AdminLayout activeItem="Reportes">
        <div className="max-w-xl mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg shadow-md text-center">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">
            Tu cuenta tiene el rol de <b>{user?.rol ?? "Usuario"}</b>. Solo los usuarios con rol{" "}
            <b>Administrador</b> pueden acceder a esta sección.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out mt-4"
          >
            Ir a la página de Login
          </Link>
        </div>
      </AdminLayout>
    )
  }
  return (
    <AdminLayout activeItem="Reportes">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Título */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Reportes del sistema</h1>
          <p className="text-muted-foreground">
            Consulta estadísticas de ventas y registros de acciones internas.
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          <ReporteVentas />
          <ReporteAcciones />
        </div>
      </div>
    </AdminLayout>
  )
}
