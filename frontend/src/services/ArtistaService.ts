import HttpClient from "./Client";

export interface Artista {
  id: string | number;
  nombre: string;
  categoria?: { id: number | string; nombre: string };
  duracionMin?: number;
  prioridad?: number;
}

interface ApiResponseData<T> {
  success: boolean;
  data: T;
}

class ArtistaService {
  private client = new HttpClient("");

  async getArtistas(): Promise<Artista[]> {
    try {
      const resp = await this.client.get<ApiResponseData<Artista[]>>("/artista");
      return resp.data || [];
    } catch (error) {
      console.error("Error al obtener artistas:", error);
      return [];
    }
  }

  // Nuevo: crear artista
  async createArtista(data: { nombre: string; duracionMin: number; categoriaId: number; prioridad: number; }): Promise<Artista | null> {
    try {
      const resp = await this.client.post<ApiResponseData<Artista>>("/artista", data);
      return resp.data || null;
    } catch (error: unknown) {
      console.error("Error al crear artista:", error);
      throw error;
    }
  }
}

export default new ArtistaService();
