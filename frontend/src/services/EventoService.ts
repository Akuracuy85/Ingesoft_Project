// src/services/EventoService.ts (CORRECCIÓN FINAL)

import { type Event } from '../models/Event'; 
import HttpClient from './Client'; 

class EventoService extends HttpClient {
    
    constructor() {
        // 🎯 CORRECCIÓN: Cambiar el basePath a singular para que coincida con la API
        super('/evento'); 
    }

    /**
     * @description Obtiene la lista de eventos PUBLICADOS.
     */
    async listar(filters: Record<string, any> = {}): Promise<Event[]> { 
        
        const params = new URLSearchParams(filters).toString();
        
        // Ahora, la URL base de Axios es /api/evento
        // y el path concatenado es /publicados?filtros
        const path = params ? `/publicados?${params}` : '/publicados';
        
        // La llamada final será: http://localhost:3000/api/evento/publicados
        const respuesta = await super.get(path); 

        return respuesta.eventos; 
    }
    
      /**
     * @description Obtiene el detalle de un evento por su ID
     */
    async obtenerPorId(id: number): Promise<Event> {
        const respuesta = await super.get(`/${id}`);
        return respuesta.evento; // el backend devuelve { success, evento }
    }

    // ... otros métodos
}

export default new EventoService();