"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Check, X } from "lucide-react"

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

interface EventsTableProps {
  events: Event[]
  onViewDetails: (event: Event) => void
  onApprove: (eventId: number) => void
  onReject: (eventId: number) => void
}

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  Pendiente: {
    label: "Pendiente",
    className: "bg-warning text-warning-foreground hover:bg-warning/80", 
  },
  Aprobado: {
    label: "Aprobado",
    className: "bg-success text-success-foreground hover:bg-success/80",
  },
  Rechazado: {
    label: "Rechazado",
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  },
}

export function EventsTable({ events, onViewDetails, onApprove, onReject }: EventsTableProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full"> {/* Usar min-w-full para manejar el overflow */}
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nombre del evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Organizador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{event.id}</td>
                <td className="px-6 py-4 text-sm text-foreground font-medium">{event.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{event.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{event.organizador}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={statusConfig[event.estado].className}>{statusConfig[event.estado].label}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {/* Botón Ver Detalles */}
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(event)} className="gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Ver detalles
                    </Button>
                    
                    {/* Botones de Aprobación/Rechazo (Solo para estado Pendiente) */}
                    {event.estado === "Pendiente" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onApprove(event.id)}
                          className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aprobar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onReject(event.id)} className="gap-1.5">
                          <X className="h-3.5 w-3.5" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No se encontraron eventos</p>
        </div>
      )}
    </div>
  )
}