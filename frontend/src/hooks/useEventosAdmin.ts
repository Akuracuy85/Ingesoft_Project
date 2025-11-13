import { useState, useEffect } from "react"
import AdminEventoService from "@/services/AdminEventoService"
import type { Event } from "@/models/Event"
import type { EventStatus } from "@/components/admin/EventTable"

export function useEventosAdmin() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await AdminEventoService.listarTodos()
        setEvents(data)
      } catch (error) {
        console.error("Error cargando eventos:", error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }
    cargar()
  }, [])

  const actualizarEstado = async (id: number, nuevo: EventStatus, comentario?: string) => {
    try {
      await AdminEventoService.cambiarEstado(id, nuevo, comentario)
      setEvents(prev =>
        prev.map(e => (e.id === id ? { ...e, estado: nuevo } : e))
      )
    } catch (error) {
      console.error("Error cambiando estado:", error)
    }
  }

  return {
    events,
    isLoading,
    aprobar: (id: number) => actualizarEstado(id, "PUBLICADO"),
    rechazar: (id: number, comentario?: string) => actualizarEstado(id, "CANCELADO", comentario),
  }
}
