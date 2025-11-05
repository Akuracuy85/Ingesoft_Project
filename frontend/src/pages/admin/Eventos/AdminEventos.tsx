"use client"

import React, { useState, useEffect } from "react"
import { Search, FileDown, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AdminLayout from "../AdminLayout" 
import { EventsTable } from "@/components/events-table"
import { EventDetailsModal } from "@/components/event-details-modal"
import { mockEvents, Event, EventStatus } from "@/data/mockEvents" /
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

// SIMULACIÓN del hook de eventos.
// Reemplaza esto con tu hook real: import { useEventos } from "../../../hooks/useEventos"
const useEventosSimulado = (useMock: boolean = true) => {
    // Si usas tanstack-query o swr, tu hook real hará la llamada a EventoService.listar()
    const [events, setEvents] = useState<Event[]>(useMock ? mockEvents : []);
    const [isLoading, setIsLoading] = useState(!useMock);
    
    // Simulación de una llamada a la API
    useEffect(() => {
        if (!useMock) {
            // Aquí iría tu lógica real:
            // EventoService.listar({ status: 'PENDIENTE' })
            //     .then(data => { setEvents(data); setIsLoading(false); })
            //     .catch(() => setIsLoading(false));
            // Por ahora, simulamos una carga corta y luego mostramos los mock events si fallara la API.
            const timer = setTimeout(() => {
                setEvents(mockEvents); // Fallback o datos reales de la API
                setIsLoading(false);
            }, 1000); 
            return () => clearTimeout(timer);
        }
    }, [useMock]);

    // Mutaciones simuladas (tu hook real usaría mutaciones de tanstack-query)
    const mutateStatus = (eventId: number, newStatus: EventStatus) => {
        // Lógica para llamar a tu API y luego actualizar el estado local/query cache
        setEvents(prev => prev.map(e => (e.id === eventId ? { ...e, estado: newStatus } : e)));
    };

    return { 
        eventsQuery: { data: events, isLoading }, 
        approveMutation: (eventId: number) => mutateStatus(eventId, "Aprobado"),
        rejectMutation: (eventId: number) => mutateStatus(eventId, "Rechazado"),
    };
};


const USE_MOCK_DATA = true;


export default function AdminEventos(): React.ReactElement {

    const { eventsQuery, approveMutation, rejectMutation } = useEventosSimulado(USE_MOCK_DATA);

    const events = eventsQuery.data ?? [];

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [activeFilter, setActiveFilter] = useState<"Todos" | EventStatus>("Todos")
    const [searchQuery, setSearchQuery] = useState("")

    // 🔎 Lógica de Filtrado (tomada del ApprovalDashboard original)
    const filteredEvents = events.filter((event) => {
        const matchesFilter = activeFilter === "Todos" || event.estado === activeFilter
        const matchesSearch =
            event.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.organizador.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleApprove = (eventId: number) => {
        approveMutation(eventId); 
        setSelectedEvent(null)
    }

    const handleReject = (eventId: number) => {
        rejectMutation(eventId);
        setSelectedEvent(null)
    }

    const handleExport = (format: string): void => {
      alert(`Exportando lista de eventos como ${format.toUpperCase()}...`);
    };

    return (
        <AdminLayout activeItem="Eventos"> {/* 👈 Integración del AdminLayout */}
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-semibold text-foreground mb-2">Gestión de aprobación de eventos</h1>
                    <p className="text-muted-foreground text-balance">
                        Revisa los eventos enviados por los organizadores y apruébalos o recházalos antes de su publicación.
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Botones de Filtro */}
                        <div className="flex gap-2 flex-wrap">
                            {(["Todos", "Pendiente", "Aprobado", "Rechazado"] as const).map((filter) => (
                                <Button
                                    key={filter}
                                    variant={activeFilter === filter ? "default" : "outline"}
                                    onClick={() => setActiveFilter(filter)}
                                    className={
                                        activeFilter === filter ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                                    }
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>

                        {/* Búsqueda */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o organizador"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>

                {/* Events Table */}
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

                {/* Export Button */}
                <div className="flex justify-end">
                    <Button variant="outline" className="gap-2 bg-transparent" onClick={() => handleExport("csv")}>
                        <FileDown className="h-4 w-4" />
                        Exportar lista (PDF / CSV)
                    </Button>
                </div>
            </div>

            {/* Event Details Modal */}
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