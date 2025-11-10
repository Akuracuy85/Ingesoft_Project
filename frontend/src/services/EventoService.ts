// src/services/EventoService.ts (COMPLETO Y CORREGIDO)

import { type Event } from '../models/Event'; 
import HttpClient from './Client'; 
import { type ZonePurchaseDetail } from '../types/ZonePurchaseDetail'; 
import { type FiltersType } from '../types/FiltersType';
import type { PriceRangeType } from '../types/PriceRangeType'; 

export type EventDetailsForPurchase = Event & { 
    zonasDisponibles: ZonePurchaseDetail[]; 
    limiteEntradas: number;
};

// ===============================================
// FUNCIÓN AUXILIAR: Formateo de Fecha
// ===============================================

/**
 * Convierte un objeto Date a una cadena YYYY-MM-DD (la API lo necesita como string).
 */
// 🛑 MODIFICACIÓN: Ahora solo acepta Date, ya que en el código fuente filtramos el null antes.
const formatDate = (date: Date): string => {
    // Utilizamos toISOString y slice para obtener el formato YYYY-MM-DD
    return date.toISOString().slice(0, 10);
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD.
const getTodayFormatted = (): string => {
  const today = new Date();
  return formatDate(today);
}
 */


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

    // 2. Mapeo de IDs (Categoría y Artista)
    if (filters.categories && filters.categories.length > 0) {
        params.categoriaIds = filters.categories; 
    }
    
    if (filters.artists && filters.artists.length > 0) {
        params.artistaIds = filters.artists; 
    }
    
    // 3. Mapeo de Rango de Fechas
    if (filters.dateRange !== null) { 
        const dateRange = filters.dateRange; // Ya es DateRangeType
        
        // 🛑 CORRECCIÓN: Comprobamos que dateRange.start/end no sean null antes de llamar a formatDate
        if (dateRange.start) {
            params.fechaInicio = formatDate(dateRange.start);
        }
        if (dateRange.end) {
            params.fechaFin = formatDate(dateRange.end);
        }
    }

    // 4. Mapeo de Rango de Precio
    if (filters.priceRange !== null) {
        const priceRange = filters.priceRange as PriceRangeType;
        if (priceRange.min !== null && priceRange.min !== undefined && priceRange.min !== '') {
            params.precioMin = priceRange.min;
        }
        if (priceRange.max !== null && priceRange.max !== undefined && priceRange.max !== '') {
            params.precioMax = priceRange.max;
        }
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
            return respuesta.eventos || respuesta; 
        } catch (error) {
            console.error("Error en la llamada a la API de eventos con filtros:", error);
            throw error;
        }
    }
    
    /**
     * Obtiene los eventos destacados (futuros y sin filtros restrictivos).
     */
    async listarDestacados(): Promise<Event[]> { 
        // 🛑 CORRECCIÓN: Creamos un objeto DateRangeType válido con un objeto Date para 'start'
        const today = new Date();
        
        const featuredFilter: FiltersType = { 
            categories: [], 
            artists: [], 
            // Usamos el tipo DateRangeType corregido: Date | null
            dateRange: { start: today, end: null }, 
            priceRange: null,
            location: { departamento: '', provincia: '', distrito: '' }
        };
        
        try {
            const params = mapFiltersToQueryParams(featuredFilter);
            const path = '/publicados';

            const respuesta = await super.get(path, { params: params }); 
            const initialData: Event[] = respuesta.eventos || respuesta;
            
            return initialData.slice(0, 5); 
        } catch (error: any) {
            if (error.response?.status !== 404) {
                 console.warn("Advertencia: No se pudieron cargar los eventos para simular destacados.", error);
            }
            return []; 
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