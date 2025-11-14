import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Check, X } from "lucide-react"
import type { Event } from "@/models/Event"

export type EventStatus = "PENDIENTE_APROBACION" | "PUBLICADO" | "CANCELADO"

interface EventsTableProps {
  events: Event[]
  onViewDetails: (event: Event) => void
  onApprove: (eventId: number) => void
  onReject: (eventId: number) => void
}

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  PENDIENTE_APROBACION: {
    label: "Pendiente",
    className: "bg-yellow-200 text-yellow-900 hover:bg-yellow-300",
  },
  PUBLICADO: {
    label: "Aprobado",
    className: "bg-green-200 text-green-900 hover:bg-green-300",
  },
  CANCELADO: {
    label: "Rechazado",
    className: "bg-red-200 text-red-900 hover:bg-red-300",
  },
}

export function EventsTable({ events, onViewDetails, onApprove, onReject }: EventsTableProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nombre del evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fecha / Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Organizador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ubicación
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
                <td className="px-6 py-4 text-sm font-medium text-foreground">{event.id}</td>

                <td className="px-6 py-4 text-sm text-foreground font-medium">{event.title}</td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {event.date} — {event.time}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {event.organizador?.RazonSocial || "Sin Organizador"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {event.departamento}, {event.provincia}
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {statusConfig[event.estado?.toUpperCase() as EventStatus] ? (
                    <Badge className={statusConfig[event.estado?.toUpperCase() as EventStatus].className}>
                      {statusConfig[event.estado?.toUpperCase() as EventStatus].label}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-200 text-gray-700">Sin estado</Badge>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2 flex-wrap">
                    {/* Ver Detalles */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(event)}
                      className="gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver detalles
                    </Button>

                    {/* Aprobar / Rechazar */}
                    {event.estado?.toUpperCase() === "PENDIENTE_APROBACION" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onApprove(event.id)}
                          className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aprobar
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onReject(event.id)}
                          className="gap-1.5"
                        >
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
