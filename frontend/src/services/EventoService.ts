// src/services/EventoService.ts (COMPLETO Y CORREGIDO FINAL)

import { type Event } from '../models/Event'; 
import HttpClient from './Client'; 
import { type ZonePurchaseDetail } from '../types/ZonePurchaseDetail'; 
import { type FiltersType } from '../types/FiltersType';
import type { PriceRangeType } from '../types/PriceRangeType'; 
import type { DateRangeType } from '../types/DateRangeType';

export type EventDetailsForPurchase = Event & { 
    zonasDisponibles: ZonePurchaseDetail[]; 
    limiteEntradas: number;
};

// ===============================================
// FUNCIÓN AUXILIAR: Formateo de Fecha
// ===============================================

/**
 * Convierte un objeto Date o string a una cadena YYYY-MM-DD.
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

    // 1. Mapeo de Ubicación 🛑 CORREGIDO: Usando nombres de columna completos
    if (filters.location?.departamento) {
        params.departamento = filters.location.departamento; // Ahora es 'departamento'
    }
    if (filters.location?.provincia) {
        params.provincia = filters.location.provincia; // Ahora es 'provincia'
    }
    if (filters.location?.distrito) {
        params.distrito = filters.location.distrito; // Ahora es 'distrito'
    }

    // 2. Mapeo de IDs (Categoría y Artista) - Correcto: Enviado como ARRAY para serialización adecuada
    if (filters.categories && filters.categories.length > 0) {
        params.categoriaIds = filters.categories; 
    }
    
    if (filters.artists && filters.artists.length > 0) {
        params.artistaIds = filters.artists; 
    }
    
    // 3. Mapeo de Rango de Fechas - Correcto: Chequeo de nulidad
    if (filters.dateRange !== null) { 
        const dateRange = filters.dateRange as DateRangeType;
        if (dateRange.start) {
            params.fechaInicio = formatDate(dateRange.start);
        }
        if (dateRange.end) {
            params.fechaFin = formatDate(dateRange.end);
        }
    }

    // 4. Mapeo de Rango de Precio - Correcto: Chequeo de nulidad
    if (filters.priceRange !== null) {
        const priceRange = filters.priceRange as PriceRangeType;
        if (priceRange.min !== null && priceRange.min !== undefined && priceRange.min !== '') {
            params.precioMin = priceRange.min;
        }
        if (priceRange.max !== null && priceRange.max !== undefined && priceRange.max !== '') {
            params.precioMax = priceRange.max;
        }
    }
    

    // Limpieza final de parámetros: Remueve null/undefined y strings vacías del objeto final.
    return Object.fromEntries(
        Object.entries(params).filter(([_, v]) => {
            if (v === null || v === undefined) return false;
            if (typeof v === 'string' && v.trim() === '') return false;
            // Permite que los arrays (filtros de IDs) pasen si tienen contenido
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