import HttpClient from "./Client"
import type { Event } from "@/models/Event"

class AdminEventoService extends HttpClient {
  constructor() {
    super("/evento")
  }

  async listarTodos(): Promise<Event[]> {
    const respuesta = await super.get<Event[]>("/listar-todos")
    return respuesta.map(e => ({
      ...e,
      estado: e.estado?.toUpperCase() ?? "PENDIENTE_APROBACION",
      organizadorNombre: e.organizadorNombre ?? "Sin organizador",
      artist: e.artist ?? { id: 0, nombre: "Sin artista" },
      zonas: e.zonas ?? [],
    }))
  }
  async cambiarEstado(id: number, nuevoEstado: string, comentario?: string) {
    return await super.put(`/estado/${id}`, {
      estado: nuevoEstado,
      comentario,
    })
  }
}

export default new AdminEventoService()
