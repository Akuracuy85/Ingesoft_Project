import HttpClient from "./Client"
import type { Event } from "@/models/Event"

class AdminEventoService extends HttpClient {
  constructor() {
    super("/evento")
  }

  async listarTodos(): Promise<Event[]> {
  const respuesta = await super.get<any>("/listar-todos");

  const eventos = Array.isArray(respuesta)
    ? respuesta
    : Array.isArray(respuesta?.data)
      ? respuesta.data
      : Array.isArray(respuesta?.eventos)
        ? respuesta.eventos
        : [];

  return eventos.map((e: any) => {
    let estadoNormalizado: "PENDIENTE_APROBACION" | "PUBLICADO" | "CANCELADO" =
      "PENDIENTE_APROBACION";

    if (typeof e.estado === "string") {
      const upper = e.estado.toUpperCase();
      if (upper.includes("PUBLIC")) estadoNormalizado = "PUBLICADO";
      else if (upper.includes("CANCEL")) estadoNormalizado = "CANCELADO";
    }

    return {
      ...e,
      estado: estadoNormalizado,
      organizador: e.organizador ?? { id: 0, nombre: "Sin organizador" },
      artist: e.artist ?? { id: 0, nombre: "Sin artista" },
      zonas: e.zonas ?? [],
    };
  });
}

  async aprobarEvento(id: number) {
    return await super.patch(`/estado/${id}/aprobar`);
  }

  async rechazarEvento(id: number, motivo?: string) {
    return await super.patch(`/estado/${id}/rechazar`, { motivo });
  }
}

export default new AdminEventoService()
