import HttpClient from "./Client";

export interface Categoria {
  id: string | number;
  nombre: string;
}

interface ApiResponseData<T> {
  success: boolean;
  data: T;
}

class CategoriaService {
  private client = new HttpClient("");

  async getCategorias(): Promise<Categoria[]> {
    try {
      const resp = await this.client.get<ApiResponseData<Categoria[]>>("/categoria");
      return resp.data || [];
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return [];
    }
  }
}

export default new CategoriaService();
