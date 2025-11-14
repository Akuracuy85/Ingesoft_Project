import { useState, useEffect } from "react"
import AdminEventoService from "@/services/AdminEventoService"
import type { Event } from "@/models/Event"

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

  const aprobar = async (id: number) => {
    try {
      await AdminEventoService.aprobarEvento(id)
      setEvents(prev =>
        prev.map(e => (e.id === id ? { ...e, estado: "PUBLICADO" } : e))
      )
    } catch (error) {
      console.error("Error aprobando evento:", error)
    }
  }

  const rechazar = async (id: number) => {
    try {
      await AdminEventoService.rechazarEvento(id)
      setEvents(prev =>
        prev.map(e => (e.id === id ? { ...e, estado: "CANCELADO" } : e))
      )
    } catch (error) {
      console.error("Error rechazando evento:", error)
    }
  }

  return {
    events,
    isLoading,
    aprobar,
    rechazar,
  }
}
