// src/services/EventoService.ts (Versión Completa y Corregida)

// Importaciones de tipos y dependencias
import { type Event } from '../models/Event'; 
import HttpClient from './Client'; // Asume que esta es tu clase base para llamadas API
// 🚨 CORRECCIÓN 1: Se elimina la importación de 'Zone' si no se usa para mantener el tipado limpio
// import { type Zone } from '../models/Zone'; 
// 🚀 CORRECCIÓN 2: Se importa el tipo correcto que usa tarifas
import { type ZonePurchaseDetail } from '../types/ZonePurchaseDetail'; 


// --- Definición del Tipo de Datos de Compra ---
/**
 * @description Define la estructura de datos que el backend retorna 
 * para el proceso de compra de un evento.
 */
export type EventDetailsForPurchase = Event & { 
    // ✅ CORRECCIÓN CLAVE: El array debe ser del tipo que contiene las tarifas
    zonasDisponibles: ZonePurchaseDetail[]; 
    limiteEntradas: number;
};

// --- Clase del Servicio ---
class EventoService extends HttpClient {
    
    constructor() {
        // Inicializa HttpClient con la ruta base de la entidad '/evento'
        super('/evento'); 
    }

    /**
     * @description Obtiene la lista de eventos PUBLICADOS (para el catálogo /eventos).
     * @param filters Filtros opcionales para la consulta.
     * @returns Una promesa que resuelve a una lista de objetos Event.
     */
    async listar(filters: Record<string, any> = {}): Promise<Event[]> { 
        
        const params = new URLSearchParams(filters).toString();
        
        // Endpoint: /api/evento/publicados?filtros
        const path = params ? `/publicados?${params}` : '/publicados';
        
        // Llama al método GET de la clase base HttpClient
        const respuesta = await super.get(path); 


        // Asumiendo que el backend devuelve { eventos: [...] }
        return respuesta.eventos; 
    }
    
    /**
     * @description Obtiene los datos específicos de UN evento por ID para el proceso de compra.
     * @param id El ID del evento a buscar.
     * @returns Una promesa que resuelve al objeto EventDetailsForPurchase.
     */
    async buscarDatosCompraPorId(id: string): Promise<EventDetailsForPurchase> { 
        
        if (!id) {
            throw new Error("Se requiere un ID de evento para la búsqueda de compra.");
        }
        
        // Endpoint: /api/evento/compra/{id}
        const path = `/compra/${id}`; 
        
        // Llama al método GET de la clase base HttpClient
        const respuesta = await super.get(path); 

        // Asumiendo que el backend devuelve directamente el objeto EventDetailsForPurchase
        return respuesta; 
    }
    
    // Aquí puedes añadir otros métodos como crearEvento, actualizarEvento, etc.
}

// Exporta una instancia única (Singleton) del servicio
export default new EventoService();