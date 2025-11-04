// src/services/EventoService.ts

import { type Event } from '../models/Event'; 
import HttpClient from './Client'; 
import { type ZonePurchaseDetail } from '../types/ZonePurchaseDetail'; 
import { type FiltersType } from '../types/FiltersType';

export type EventDetailsForPurchase = Event & { 
    zonasDisponibles: ZonePurchaseDetail[]; 
    limiteEntradas: number;
};

// ===============================================
// FUNCIÓN AUXILIAR: Formateo de Fecha
// ===============================================

/**
 * Convierte un objeto Date a una cadena YYYY-MM-DD.
 */
const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
        return date;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


// ===============================================
// FUNCIÓN DE MAPEADO: Convierte el objeto FiltersType a Query Params
// ===============================================

const mapFiltersToQueryParams = (filters: FiltersType): Record<string, any> => {
    const params: Record<string, any> = {};

    // 1. Mapeo de Ubicación
    if (filters.location?.departamento) {
        params.departamento = filters.location.departamento; 
    }
    if (filters.location?.provincia) {
        params.provincia = filters.location.provincia;
    }
    if (filters.location?.distrito) {
        params.distrito = filters.location.distrito;
    }

    // 2. Mapeo de IDs (Categoría y Artista) 🛑 USANDO .join(',')
    if (filters.categories && filters.categories.length > 0) {
        params.categoriaId = filters.categories.join(','); 
    }
    
    if (filters.artists && filters.artists.length > 0) {
        params.artistaId = filters.artists.join(','); 
    }
    
    // 3. Mapeo de Rango de Fechas
    if (filters.dateRange?.start) {
        params.fechaInicio = formatDate(filters.dateRange.start);
    }
    if (filters.dateRange?.end) {
        params.fechaFin = formatDate(filters.dateRange.end);
    }

    // 4. Mapeo de Rango de Precio (usa 'min' y 'max' y verificación de cadena vacía)
    if (filters.priceRange?.min !== null && filters.priceRange?.min !== undefined && filters.priceRange.min !== '') {
        params.precioMin = filters.priceRange.min;
    }
    if (filters.priceRange?.max !== null && filters.priceRange?.max !== undefined && filters.priceRange.max !== '') {
        params.precioMax = filters.priceRange.max;
    }
    

    // Limpieza final de parámetros
    return Object.fromEntries(
        Object.entries(params).filter(([_, v]) => {
            if (v === null || v === undefined) return false;
            if (typeof v === 'string' && v.trim() === '') return false;
            return true;
        })
    );
};

// ===============================================
// CLASE EVENTOSERVICE
// ===============================================

class EventoService extends HttpClient {
    
    constructor() {
        super('/evento'); // Base path para las llamadas a la API
    }

    /**
     * Obtiene una lista de eventos, aplicando filtros.
     */
    async listar(filters: FiltersType): Promise<Event[]> { 
        
        const path = '/publicados';
        
        const params = mapFiltersToQueryParams(filters);
        
        console.log("EventoService -> Query Params Enviados:", params);

        try {
            const respuesta = await super.get(path, { params: params }); 

            return respuesta.eventos; 
        } catch (error) {
            console.error("Error en la llamada a la API de eventos con filtros:", error);
            throw error;
        }
    }
    
    // ------------------------------------
    // OTROS MÉTODOS
    // ------------------------------------

    async buscarDatosCompraPorId(id: string): Promise<EventDetailsForPurchase> { 
        if (!id) {
            throw new Error("Se requiere un ID de evento para la búsqueda de compra.");
        }
        
        const path = `/compra/${id}`; 
        
        const respuesta = await super.get(path); 

        return respuesta; 
    }
    
    async obtenerPorId(id: number): Promise<Event> {
        if (!id) throw new Error("Se requiere un ID válido de evento");
        
        const respuesta = await super.get(`/${id}`);
        return respuesta.evento; 
    }
}

export default new EventoService();