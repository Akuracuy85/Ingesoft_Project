// src/services/MetadataService.ts (CORREGIDO)

import HttpClient from "./Client";

// Interfaces para los datos que esperamos del backend
export interface FilterOption {
    id: string; // O number, si el backend usa IDs numéricos
    nombre: string;
}

// Interfaz específica para Ubicaciones
export interface LocationOption {
    id: string;
    nombre: string;
}

class MetadataService extends HttpClient {
    constructor() {
        super("/metadata"); 
    }

    /**
     * Obtiene la lista de categorías disponibles para filtrar eventos.
     * Endpoint esperado: /api/metadata/categorias
     */
    async getCategorias(): Promise<FilterOption[]> {
        try {
            // El BE devuelve { categorias: [...] }
            const respuesta = await this.get<{ categorias: FilterOption[] }>('/categorias');
            return respuesta.categorias || [];
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            return [];
        }
    }

    /**
     * Obtiene la lista de artistas disponibles para sugerencias de filtro.
     * Endpoint esperado: /api/metadata/artistas
     */
    async getArtistas(): Promise<FilterOption[]> {
        try {
            // El BE devuelve { artistas: [...] }
            const respuesta = await this.get<{ artistas: FilterOption[] }>('/artistas');
            return respuesta.artistas || [];
        } catch (error) {
            console.error("Error al obtener artistas:", error);
            return [];
        }
    }

    /**
     * Obtiene la lista principal de ubicaciones (Departamentos).
     * Endpoint esperado: /api/metadata/ubicaciones/departamentos
     */
    async getDepartamentos(): Promise<LocationOption[]> {
        try {
            // El BE devuelve { departamentos: [...] }
            const respuesta = await this.get<{ departamentos: LocationOption[] }>('/ubicaciones/departamentos');
            return respuesta.departamentos || [];
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
            return [];
        }
    }
    
    /**
     * Obtiene la lista de provincias basadas en un Departamento ID.
     * Endpoint esperado: /api/metadata/ubicaciones/provincias?departamentoId={id}
     */
    async getProvincias(departamentoId: string): Promise<LocationOption[]> {
        if (!departamentoId) return [];
        try {
            const path = '/ubicaciones/provincias';
            const respuesta = await this.get<{ provincias: LocationOption[] }>(path, { 
                params: { departamentoId } 
            });
            return respuesta.provincias || [];
        } catch (error) {
            console.error(`Error al obtener provincias para ${departamentoId}:`, error);
            return [];
        }
    }

    /**
     * Obtiene la lista de distritos basados en una Provincia ID.
     * Endpoint esperado: /api/metadata/ubicaciones/distritos?provinciaId={id}
     */
    async getDistritos(provinciaId: string): Promise<LocationOption[]> {
        if (!provinciaId) return [];
        try {
            const path = '/ubicaciones/distritos';
            const respuesta = await this.get<{ distritos: LocationOption[] }>(path, { 
                params: { provinciaId } 
            });
            return respuesta.distritos || [];
        } catch (error) {
            console.error(`Error al obtener distritos para ${provinciaId}:`, error);
            return [];
        }
    }
}

export default new MetadataService();