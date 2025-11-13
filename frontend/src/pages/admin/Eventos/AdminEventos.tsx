import React, { useState, useEffect } from "react"
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Rol } from "@/models/User";
import { Search, Loader2, AlertTriangle, FileDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AdminLayout from "../AdminLayout"
import { EventsTable } from "@/components/admin/EventTable"
import { EventDetailsModal } from "@/components/admin/EventModal"
import EventoService from "@/services/EventoService"
import type { Event } from "@/models/Event"

export type EventStatus = "PENDIENTE_APROBACION" | "PUBLICADO" | "CANCELADO"

const useEventos = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const data = await EventoService.listar({
          categories: [],
          artists: [],
          dateRange: null,
          priceRange: null,
          location: { departamento: "", provincia: "", distrito: "" },
        })
        setEvents(data as Event[])
      } catch (error) {
        console.error("Error cargando eventos:", error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    cargarEventos()
  }, [])
  const updateStatus = (id: number, nuevoEstado: EventStatus) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, estado: nuevoEstado } : e)))
  }

  return {
    eventsQuery: { data: events, isLoading },
    approveMutation: (id: number) => updateStatus(id, "PUBLICADO"),
    rejectMutation: (id: number) => updateStatus(id, "CANCELADO"),
  }
}


export default function AdminEventos(): React.ReactElement {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const REQUIRED_ROLE: Rol = "ADMINISTRADOR"; 

  const { eventsQuery, approveMutation, rejectMutation } = useEventos()
  const events = eventsQuery.data ?? []

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [activeFilter, setActiveFilter] = useState<"Todos" | EventStatus>("Todos")
  const [searchQuery, setSearchQuery] = useState("")


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
      <AdminLayout activeItem="Gestión de eventos">
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

  const filteredEvents = events.filter(event => {
    const matchesFilter = activeFilter === "Todos" || event.estado === activeFilter
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizadorNombre.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleApprove = (id: number) => {
    approveMutation(id)
    setSelectedEvent(null)
  }

  const handleReject = (id: number) => {
    rejectMutation(id)
    setSelectedEvent(null)
  }

  const handleExport = (format: string) => {
    console.log(`Exportando lista de eventos como ${format.toUpperCase()}...`)
  }

  return (
    <AdminLayout activeItem="Gestión de eventos">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Gestión de aprobación de eventos
          </h1>
          <p className="text-muted-foreground text-balance">
            Revisa los eventos enviados por los organizadores y apruébalos o recházalos antes de su publicación.
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {(["Todos", "Pendiente", "Aprobado", "Rechazado"] as const).map(filter => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter as "Todos" | EventStatus)}
                  className={activeFilter === filter ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                >
                  {filter}
                </Button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o organizador"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {eventsQuery.isLoading ? (
            <div className="py-12 text-center flex justify-center items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-muted-foreground">Cargando eventos...</p>
            </div>
          ) : (
            <EventsTable
              events={filteredEvents}
              onViewDetails={setSelectedEvent}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>

        {/* Exportar */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => handleExport("csv")}
          >
            <FileDown className="h-4 w-4" />
            Exportar lista (PDF / CSV)
          </Button>
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </AdminLayout>
  )
}
