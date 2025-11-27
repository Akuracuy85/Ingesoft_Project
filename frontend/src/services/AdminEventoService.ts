import HttpClient from "./Client"
import type { Event } from "@/models/Event"

class AdminEventoService extends HttpClient {
  constructor() {
    super("/evento")
  }

  async listarTodos(): Promise<Event[]> {
    const respuesta = await super.get<any>("/listar-todos")

    const eventos = Array.isArray(respuesta)
      ? respuesta
      : Array.isArray(respuesta?.data)
      ? respuesta.data
      : Array.isArray(respuesta?.eventos)
      ? respuesta.eventos
      : []

    //console.log("Eventos originales del backend:", eventos)

    const filtrados = eventos.filter((e: any) => {
      const estado = e.estado?.toUpperCase?.() || ""
      return ["PENDIENTE_APROBACION", "PUBLICADO", "CANCELADO"].includes(estado)
    })

    //console.log("Filtrados: ", respuesta)

    return filtrados.map((e: any) => {
      let estadoNormalizado: "PENDIENTE_APROBACION" | "PUBLICADO" | "CANCELADO" =
        "PENDIENTE_APROBACION"

      if (typeof e.estado === "string") {
        const upper = e.estado.toUpperCase()
        if (upper.includes("PUBLIC")) estadoNormalizado = "PUBLICADO"
        else if (upper.includes("CANCEL")) estadoNormalizado = "CANCELADO"
        else if (upper.includes("PEND")) estadoNormalizado = "PENDIENTE_APROBACION"
      }

      let date = ""
      let time = ""
      if (e.fechaEvento) {
        const fecha = new Date(e.fechaEvento)
        date = fecha.toISOString().split("T")[0]
        time = fecha.toISOString().split("T")[1]?.slice(0, 5) || ""
      }

      return {
        id: e.id,
        title: e.nombre ?? "",
        description: e.descripcion ?? "",
        date,
        time,
        departamento: e.departamento ?? "",
        provincia: e.provincia ?? "",
        distrito: e.distrito ?? "",
        place: e.lugar ?? "",
        image: e.imagenBanner
          ? "data:image/png;base64," + (e.imagenBanner.data?.toString("base64") ?? "")
          : "",
        artist: e.artista ?? { id: 0, nombre: "Sin artista" },
        zonas: e.zonas ?? [],
        organizador: e.organizador ?? null,
        estado: estadoNormalizado,
        terminosUso: e.terminosUso,
        documentosRespaldo: e.documentosRespaldo
      }
    })
  }


  async aprobarEvento(id: number) {
    return await super.patch(`/estado/${id}/aprobar`);
  }

  async rechazarEvento(id: number, motivo?: string) {
    return await super.patch(`/estado/${id}/rechazar`, { motivo });
  }
}

export default new AdminEventoService()
