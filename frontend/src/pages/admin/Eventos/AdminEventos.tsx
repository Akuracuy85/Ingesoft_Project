import React, { useState, useEffect } from "react"
import { Search, FileDown, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AdminLayout from "../AdminLayout"
import { EventsTable } from "@/components/admin/EventTable"
import { EventDetailsModal } from "@/components/admin/EventModal"
import EventoService from "@/services/EventoService"
export type EventStatus = "Pendiente" | "Aprobado" | "Rechazado"

export interface Event {
  id: number
  nombre: string
  fecha: string
  organizador: string
  estado: EventStatus
  descripcion: string
  lugar: string
  zonas: { nombre: string; precio: number; capacidad: number }[]
  documentos: { nombre: string; url: string; estado: string }[]
}


const mockEvents: Event[] = [
  {
    id: 1,
    nombre: "Festival de Música Lima 2025",
    fecha: "2025-12-10",
    organizador: "LimaSound",
    estado: "Pendiente",
    descripcion: "Gran festival de música en Lima con artistas nacionales e internacionales.",
    lugar: "Parque de la Exposición",
    zonas: [
      { nombre: "VIP", precio: 250, capacidad: 500 },
      { nombre: "General", precio: 100, capacidad: 2000 },
    ],
    documentos: [
      { nombre: "Permiso Municipal", url: "#", estado: "Aprobado" },
      { nombre: "Licencia de Seguridad", url: "#", estado: "Pendiente" },
    ],
  },
  {
    id: 2,
    nombre: "Maratón Arequipa 2025",
    fecha: "2025-11-22",
    organizador: "ArequipaRun",
    estado: "Aprobado",
    descripcion: "Competencia anual de maratón con categorías para todas las edades.",
    lugar: "Plaza de Armas de Arequipa",
    zonas: [{ nombre: "Participante", precio: 50, capacidad: 1500 }],
    documentos: [
      { nombre: "Certificado de Salud", url: "#", estado: "Aprobado" },
      { nombre: "Permiso Municipal", url: "#", estado: "Aprobado" },
    ],
  },
]


const useEventos = (usarMock: boolean = false) => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        if (usarMock) {
          setEvents(mockEvents)
        } else {
          const data = await EventoService.listar({
            categories: [],
            artists: [],
            dateRange: null,
            priceRange: null,
            location: { departamento: "", provincia: "", distrito: "" },
          })
          setEvents(data as any[])
        }
      } catch (error) {
        console.error("Error cargando eventos:", error)
        setEvents(mockEvents)
      } finally {
        setIsLoading(false)
      }
    }

    cargarEventos()
  }, [usarMock])

  // Mutaciones (Aprobar/Rechazar)
  const updateStatus = (id: number, nuevoEstado: EventStatus) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, estado: nuevoEstado } : e)))
  }

  return {
    eventsQuery: { data: events, isLoading },
    approveMutation: (id: number) => updateStatus(id, "Aprobado"),
    rejectMutation: (id: number) => updateStatus(id, "Rechazado"),
  }
}


export default function AdminEventos(): React.ReactElement {
  const USE_MOCK = true // cambia a false para probar con el backend real

  const { eventsQuery, approveMutation, rejectMutation } = useEventos(USE_MOCK)
  const events = eventsQuery.data ?? []

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [activeFilter, setActiveFilter] = useState<"Todos" | EventStatus>("Todos")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEvents = events.filter(event => {
    const matchesFilter = activeFilter === "Todos" || event.estado === activeFilter
    const matchesSearch =
      event.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizador.toLowerCase().includes(searchQuery.toLowerCase())
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
    alert(`Exportando lista de eventos como ${format.toUpperCase()}...`)
  }

  return (
    <AdminLayout activeItem="Gestión de eventos">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Gestión de aprobación de eventos</h1>
          <p className="text-muted-foreground text-balance">
            Revisa los eventos enviados por los organizadores y apruébalos o recházalos antes de su publicación.
          </p>
        </div>

        {/* Filtros + búsqueda */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {(["Todos", "Pendiente", "Aprobado", "Rechazado"] as const).map(filter => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter)}
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
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => handleExport("csv")}>
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
