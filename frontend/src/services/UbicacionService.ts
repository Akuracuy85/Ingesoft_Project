import HttpClient from "./Client";

export interface LocationOption {
  id: string | number;
  nombre: string;
}

interface ApiResponseData<T> {
  success: boolean;
  data: T;
}

interface UbicacionesResponse {
  [departamento: string]: {
    [provincia: string]: string[];
  };
}

let cache: UbicacionesResponse | null = null;

class UbicacionService {
  private client = new HttpClient("");

  async getUbicaciones(): Promise<UbicacionesResponse> {
    if (cache) return cache;

    const resp = await this.client.get<ApiResponseData<UbicacionesResponse>>("/evento/filtros/ubicaciones");
    cache = resp.data;
    return cache!;
  }

  async getDepartamentos(): Promise<LocationOption[]> {
    const data = await this.getUbicaciones();
    return Object.keys(data).map((nombre) => ({ id: nombre, nombre }));
  }

  async getProvincias(departamento: string): Promise<LocationOption[]> {
    const data = await this.getUbicaciones();
    const provincias = data[departamento];
    if (!provincias) return [];
    return Object.keys(provincias).map((nombre) => ({ id: nombre, nombre }));
  }

  async getDistritos(departamento: string, provincia: string): Promise<LocationOption[]> {
    const data = await this.getUbicaciones();
    const distritos = data[departamento]?.[provincia];
    if (!distritos) return [];
    return distritos.map((nombre) => ({ id: nombre, nombre }));
  }
}

export default new UbicacionService();
