import React, { useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import type { Rol } from "@/models/User"
import { AlertTriangle } from "lucide-react"

import AdminLayout from "../AdminLayout"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TerminosUniteCard from "@/components/admin/TerminosUniteCard"
import { GenericService } from "@/services/GenericService"

export default function TerminosCondiciones(): React.ReactElement {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const REQUIRED_ROLE: Rol = "ADMINISTRADOR"
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Cargando autenticación...
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (user?.rol !== REQUIRED_ROLE) {
    return (
      <AdminLayout activeItem="Terminos y Condiciones">
        <div className="max-w-xl mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg shadow-md text-center">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">
            Tu cuenta tiene el rol de <b>{user?.rol ?? "Usuario"}</b>. Solo los usuarios con rol{" "}
            <b>Administrador</b> pueden acceder a esta sección.
          </p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeItem="Terminos y Condiciones">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Título */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Términos y Condiciones</h1>
          <p className="text-muted-foreground">
            Visualiza y descarga los términos y condiciones actuales del sistema.
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
            <span className="text-sm text-gray-600">
              Haz clic en el botón para ver los términos y condiciones actuales.
            </span>
            <a
              href={GenericService.TYC_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-[#E58E00] text-white text-sm font-medium rounded-md shadow-sm hover:bg-[#E58E00]/90 transition duration-150 ease-in-out cursor-pointer"
            >
              Ver Términos
            </a>
          </div>

          {/* Botón para abrir el modal */}
          <div className="text-right">
            <button
              onClick={() => {
                setIsOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-[#E58E00] text-white text-sm font-medium rounded-md shadow-sm hover:bg-[#E58E00]/90 transition duration-150 ease-in-out cursor-pointer"
            >
              Subir nuevos términos
            </button>
          </div>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sube nuevos Terminos y Condiciones</DialogTitle>
            </DialogHeader>
            <TerminosUniteCard handleSubmit={() => { setIsOpen(false) }} />
          </DialogContent>
        </Dialog>
    </AdminLayout>
  )
}
