import HttpClient from "./Client";
import type { TurnoCola } from "../models/TurnoCola";

class ColaService extends HttpClient {
  constructor() {
    super("/cola");
  }

  async crearCola(eventoId: number) {
    const res = await this.post(`/crear/${eventoId}`);
    return res?.data;
  }

  async ingresarUsuarioACola(eventoId: number) {
    const res = await this.post(`/ingresar/${eventoId}`);
    return res?.data;
  }

  async obtenerPosicion(colaId: number): Promise<TurnoCola> {
    const res = await this.get(`/verificar/${colaId}`);
    return res?.data;
  }

  async enviarHeartbeat(colaId: number) {
    return await this.post(`/heartbeat/${colaId}`);
  }

  async eliminarTurno(colaId: number) {
    return await this.delete(`/eliminar/${colaId}`);
  }
}

export default new ColaService();
