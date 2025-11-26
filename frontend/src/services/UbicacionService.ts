import type { Departamento } from "@/models/Departamento";
import type { Provincia } from "@/models/Provincia";
import HttpClient from "./Client";

export interface LocationOption {
  id: string | number;
  nombre: string;
}

// La respuesta de la API que contiene la data
interface ApiResponse {
  success: boolean;
  data: Departamento[];
}

let cache: Departamento[] | null = null;

class UbicacionService {
  private client = new HttpClient(""); 

  private async getUbicaciones(): Promise<Departamento[]> {
    if (cache) {
      return cache;
    }

    const resp = await this.client.get<ApiResponse>("/ubicaciones");
    cache = resp.data; 
    return cache!;
  }

  async getDepartamentos(): Promise<LocationOption[]> {
    const data = await this.getUbicaciones();
    return data.map((departamento: Departamento) => ({ id: departamento.id, nombre: departamento.nombre }));
  }

  async getProvincias(departamentoId: number): Promise<LocationOption[]> {
    const data = await this.getUbicaciones();
    const provincias = data.find((dep) => dep.id === departamentoId)?.provincias;

    if (!provincias) {
      return [];
    }

    return provincias.map((prov: Provincia) => ({ id: prov.id, nombre: prov.nombre }));
  }

  async getDistritos(departamentoId: number, provinciaId: number): Promise<LocationOption[]> {
    const data = await this.getUbicaciones();
    const distritos = data
      .find((dep) => dep.id === departamentoId)
      ?.provincias.find((prov) => prov.id === provinciaId)
      ?.distritos;

    if (!distritos) {
      return [];
    }

    return distritos.map((distrito) => ({ id: distrito.id, nombre: distrito.nombre }));
  }
}

export default new UbicacionService();
