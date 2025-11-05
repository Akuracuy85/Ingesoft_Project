import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { X, Check, XIcon, FileText } from "lucide-react"
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
interface EventDetailsModalProps {
  event: Event
  onClose: () => void
  onApprove: (eventId: number) => void
  onReject: (eventId: number, comment?: string) => void // Acepta el comentario
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
      case "Aprobado":
      case "aprobado":
        return "bg-success text-success-foreground hover:bg-success/80"
      case "Rechazado":
      case "rechazado":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/80"
      case "Pendiente":
      case "pendiente":
      default:
        return "bg-warning text-warning-foreground hover:bg-warning/80"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-2xl font-semibold text-foreground">Detalles del evento</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre del evento</label>
              <p className="mt-1 text-foreground font-medium">{event.nombre}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha</label>
              <p className="mt-1 text-foreground">{event.fecha}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Organizador</label>
              <p className="mt-1 text-foreground">{event.organizador}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Lugar</label>
              <p className="mt-1 text-foreground">{event.lugar}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Descripción breve</label>
            <p className="mt-1 text-foreground leading-relaxed whitespace-pre-line">{event.descripcion}</p>
          </div>

          {/* Zones and Prices */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Zonas y precios</label>
            <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Zona</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Precio</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Capacidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {event.zonas.map((zona, index) => (
                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-2 text-sm text-foreground">{zona.nombre}</td>
                      <td className="px-4 py-2 text-sm text-foreground font-mono">S/{zona.precio.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-foreground">{zona.capacidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Documentos adjuntos</label>
            <div className="space-y-2">
              {event.documentos.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                >
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium underline-offset-4 hover:underline">{doc.nombre}</span>
                  </a>
                  <Badge className={getBadgeClass(doc.estado)}>{doc.estado}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Current Status */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Estado actual del evento</label>
            <div className="mt-2">
              <Badge className={getBadgeClass(event.estado)}>{event.estado}</Badge>
            </div>
          </div>

          {/* Comment & Actions (Visible only if Pendiente) */}
          {event.estado === "Pendiente" && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Comentario de aprobación/rechazo (Opcional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe un comentario o motivo de rechazo. Este será visible para el organizador."
                  className="mt-2"
                  rows={3}
                />
              </div>
              
              {/* Footer Actions */}
              <div className="flex gap-3 pt-3 border-t border-border">
                <Button
                  onClick={handleApprove}
                  className="flex-1 gap-2 bg-success text-success-foreground hover:bg-success/90"
                >
                  <Check className="h-4 w-4" />
                  Aprobar evento
                </Button>
                <Button 
                  onClick={handleReject} 
                  variant="destructive" 
                  className="flex-1 gap-2"
                  // Deshabilitar el rechazo si es necesario un comentario obligatorio
                  // disabled={comment.trim() === ''} 
                >
                  <XIcon className="h-4 w-4" />
                  Rechazar evento
                </Button>
              </div>
            </>
          )}

          {/* Si ya está Aprobado o Rechazado, solo mostrar el botón de cerrar */}
          {event.estado !== "Pendiente" && (
            <div className="flex justify-end p-6 border-t border-border">
              <Button onClick={onClose} variant="secondary">Cerrar</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}