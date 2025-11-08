import HttpClient from "./Client";

export interface Artista {
  id: string | number;
  nombre: string;
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
}

export default new ArtistaService();
