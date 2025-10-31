import HttpClient from "./Client";
import type { TurnoCola } from "../models/TurnoCola";

class TurnoColaService extends HttpClient {
  constructor() {
    // cuando tu back defina la ruta, solo cambias el prefijo
    super("/turno-cola");
  }

  async getAll(): Promise<TurnoCola[]> {
    const res = await this.get<any>("");
    // tu backend puede devolver un array directo o { data: [...] }
    return Array.isArray(res) ? res : res?.data || [];
  }

  async getById(id: number): Promise<TurnoCola> {
    const res = await this.get<TurnoCola>(`/${id}`);
    return res;
  }

  async create(turnoData: Omit<TurnoCola, "id">): Promise<TurnoCola> {
    const res = await this.post<TurnoCola>("", turnoData);
    return res;
  }

  async update(id: number, turnoData: Partial<TurnoCola>): Promise<TurnoCola> {
    const res = await this.put<TurnoCola>(`/${id}`, turnoData);
    return res;
  }

  async changeEstado(id: number, nuevoEstado: string): Promise<TurnoCola> {
    const res = await this.patch<TurnoCola>(`/${id}/estado`, { estado: nuevoEstado });
    return res;
  }
}

export default new TurnoColaService();
