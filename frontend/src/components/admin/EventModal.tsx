import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { X, Check, XIcon, FileText, MapPin, CalendarDays, User } from "lucide-react"
import type { Event } from "@/models/Event"

export type EventStatus = "PENDIENTE_APROBACION" | "PUBLICADO" | "CANCELADO"

interface EventDetailsModalProps {
  event: Event
  onClose: () => void
  onApprove: (eventId: number) => void
  onReject: (eventId: number, comment?: string) => void
}

export function EventDetailsModal({ event, onClose, onApprove, onReject }: EventDetailsModalProps) {
  const [comment, setComment] = useState("")

  const handleApprove = () => {
    onApprove(event.id)
    onClose()
  }

  const handleReject = () => {
    onReject(event.id, comment)
    onClose()
  }

  const getBadgeClass = (status: EventStatus | string) => {
    switch (status) {
      case "PUBLICADO":
        return "bg-green-200 text-green-800"
      case "CANCELADO":
        return "bg-red-200 text-red-800"
      case "PENDIENTE_APROBACION":
      default:
        return "bg-yellow-200 text-yellow-800"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-2xl font-semibold text-foreground">Detalles del evento</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Título del evento</label>
              <p className="mt-1 text-foreground font-medium">{event.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha y hora</label>
              <p className="mt-1 flex items-center gap-2 text-foreground">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {event.date} — {event.time}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Artista</label>
              <p className="mt-1 flex items-center gap-2 text-foreground">
                <User className="h-4 w-4 text-muted-foreground" />
                {event.artist?.nombre ?? "Sin artista"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Lugar</label>
              <p className="mt-1 flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {event.place}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {event.departamento}, {event.provincia}, {event.distrito}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Descripción</label>
            <p className="mt-1 text-foreground leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Zonas */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Zonas y tarifas
            </label>
            <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Zona
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Capacidad
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Vendidas
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Tarifa normal
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Tarifa preventa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {event.zonas.map((zona, index) => (
                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-2 text-sm text-foreground">{zona.nombre}</td>
                      <td className="px-4 py-2 text-sm text-foreground">{zona.capacidad}</td>
                      <td className="px-4 py-2 text-sm text-foreground">{zona.cantidadComprada}</td>
                      <td className="px-4 py-2 text-sm text-foreground font-mono">
                        S/ {zona.tarifaNormal.precio.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-foreground font-mono">
                        {zona.tarifaPreventa
                          ? `S/ ${zona.tarifaPreventa.precio.toFixed(2)}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documento único */}
          {event.documento && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Documento adjunto
              </label>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <a
                  href={event.documento}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium underline-offset-4 hover:underline">
                    Descargar documento
                  </span>
                </a>
                <Badge className={getBadgeClass(event.estado)}>{event.estado}</Badge>
              </div>
            </div>
          )}

          {/* Estado */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Estado actual del evento
            </label>
            <div className="mt-2">
              <Badge className={getBadgeClass(event.estado)}>{event.estado}</Badge>
            </div>
          </div>

          {/* Comentario y acciones */}
          {event.estado === "PENDIENTE_APROBACION" && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Comentario de aprobación o rechazo (opcional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe un comentario para el organizador..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-border">
                <Button
                  onClick={handleApprove}
                  className="flex-1 gap-2 bg-green-600 text-white hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Aprobar evento
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  <XIcon className="h-4 w-4" />
                  Rechazar evento
                </Button>
              </div>
            </>
          )}

          {/* Si ya está publicado o cancelado */}
          {event.estado !== "PENDIENTE_APROBACION" && (
            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={onClose} variant="secondary">
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
