// src/services/EventoService.ts (Versión de Producción sin Mocking)

import { type Event } from '../models/Event'; 
import HttpClient from './Client'; 
import { type ZonePurchaseDetail } from '../types/ZonePurchaseDetail'; 

// 🛑 ELIMINADAS: Importaciones y declaraciones relacionadas con el mocking (MOCK_EVENTS, USE_MOCK_DATA)

export type EventDetailsForPurchase = Event & { 
    zonasDisponibles: ZonePurchaseDetail[]; 
    limiteEntradas: number;
};

class EventoService extends HttpClient {
    
    constructor() {
        super('/evento'); // Base path para las llamadas a la API
    }

    /**
     * Obtiene una lista de eventos, aplicando filtros si son provistos,
     * enviando los filtros al backend.
     * @param filters Objeto con los parámetros de filtro mapeados (ej: {departamento: 'Lima'}).
     */
    async listar(filters: Record<string, any> = {}): Promise<Event[]> { 
        
        // ------------------------------------
        // CÓDIGO DE PRODUCCIÓN REAL (FILTRADO EN BACKEND)
        // ------------------------------------
        
        // 🛑 Lógica de Mocking ANTES aquí. Ahora solo está la llamada a la API.
        
        const path = '/publicados';
        
        try {
            // Pasamos el objeto 'filters' al método 'get' para que el backend maneje los query params.
            const respuesta = await super.get(path, { params: filters }); 

            // Asume que el BE devuelve { eventos: [...] }
            return respuesta.eventos; 
        } catch (error) {
            console.error("Error en la llamada a la API de eventos:", error);
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