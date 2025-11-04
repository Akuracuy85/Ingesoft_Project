// src/services/MetadataService.ts (VERSIÓN CORREGIDA FINAL)

import HttpClient from "./Client";

// Interfaces para los datos que esperamos del backend
export interface FilterOption {
    id: string | number; 
    nombre: string;
}

export interface LocationOption {
    id: string | number;
    nombre: string;
}

// Interfaz para manejar la respuesta del backend
interface ApiResponseData<T> {
    success: boolean;
    data: T;
}

// Interfaz específica para el endpoint de Ubicaciones
interface UbicacionesResponse {
    [departamento: string]: {
        [provincia: string]: string[]; // Array de nombres de distritos
    };
}

// 🛑 ALMACÉN DE CACHÉ: Guarda el resultado anidado para evitar llamadas repetidas al BE
let ubicacionesCache: UbicacionesResponse | null = null; 

class MetadataService {
    private client = new HttpClient(""); 

    // --- MÉTODOS EXISTENTES (CATEGORÍAS Y ARTISTAS) ---
    // ... (Mantener sin cambios) ...

    async getCategorias(): Promise<FilterOption[]> {
        try {
            const respuesta = await this.client.get<ApiResponseData<FilterOption[]>>('/categoria'); 
            return respuesta.data || [];
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            return [];
        }
    }

    async getArtistas(): Promise<FilterOption[]> {
        try {
            const respuesta = await this.client.get<ApiResponseData<FilterOption[]>>('/artista');
            return respuesta.data || [];
        } catch (error) {
            console.error("Error al obtener artistas:", error);
            return [];
        }
    }

    // --- MÉTODOS DE UBICACIÓN ---

    async getDepartamentos(): Promise<LocationOption[]> {
        try {
            // 🛑 1. Usar caché si ya está llena
            if (ubicacionesCache) {
                // 🛑 CORRECCIÓN: Usar el NOMBRE como ID también en el caché
                return Object.keys(ubicacionesCache).map((nombre) => ({ id: nombre, nombre: nombre }));
            }
            
            const respuesta = await this.client.get<ApiResponseData<UbicacionesResponse>>('/evento/filtros/ubicaciones');
            
            // 2. Llenar la caché
            ubicacionesCache = respuesta.data;
            
            // 3. Mapear las claves (nombres de departamento) a LocationOption
            const departamentos: LocationOption[] = Object.keys(ubicacionesCache!).map((nombre) => ({
                id: nombre, // 🛑 CRÍTICO: Usamos el NOMBRE como ID
                nombre: nombre
            }));

            return departamentos;
            
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
            return [];
        }
    }
    
    /**
     * Obtiene las provincias para un departamento dado.
     * @param departamentoNombre El nombre exacto del departamento seleccionado.
     */
    async getProvincias(departamentoNombre: string): Promise<LocationOption[]> {
        if (!ubicacionesCache) await this.getDepartamentos(); 

        const provinciasMap = ubicacionesCache?.[departamentoNombre];
        if (!provinciasMap) return [];
        
        return Object.keys(provinciasMap).map((nombre) => ({
            id: nombre, 
            nombre: nombre,
        }));
    }

    /**
     * Obtiene los distritos para una provincia y departamento dados.
     * @param departamentoNombre El nombre exacto del departamento.
     * @param provinciaNombre El nombre exacto de la provincia seleccionada.
     */
    async getDistritos(departamentoNombre: string, provinciaNombre: string): Promise<LocationOption[]> {
        if (!ubicacionesCache) await this.getDepartamentos(); 

        const distritosArray = ubicacionesCache?.[departamentoNombre]?.[provinciaNombre];
        if (!distritosArray) return [];
        
        return distritosArray.map((nombre) => ({
            id: nombre, 
            nombre: nombre,
        }));
    }
}

export default new MetadataService();