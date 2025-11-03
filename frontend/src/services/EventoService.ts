// src/services/EventoService.ts (Versión Completa y Corregida)


import { type Event } from '../models/Event'; 
import HttpClient from './Client'; 

import { type ZonePurchaseDetail } from '../types/ZonePurchaseDetail'; 

export type EventDetailsForPurchase = Event & { 

    zonasDisponibles: ZonePurchaseDetail[]; 
    limiteEntradas: number;
};

class EventoService extends HttpClient {
    
    constructor() {

        super('/evento'); 
    }

    async listar(filters: Record<string, any> = {}): Promise<Event[]> { 
        
        const params = new URLSearchParams(filters).toString();

        const path = params ? `/publicados?${params}` : '/publicados';

        const respuesta = await super.get(path); 


        return respuesta.eventos; 
    }
    
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