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

  // Nuevo: crear categoría
  async createCategoria(data: { nombre: string }): Promise<Categoria | null> {
    try {
      const resp = await this.client.post<ApiResponseData<Categoria>>("/categoria", data);
      return resp.data || null;
    } catch (error: unknown) {
      console.error("Error al crear categoría:", error);
      throw error;
    }
  }
}

export default new CategoriaService();
