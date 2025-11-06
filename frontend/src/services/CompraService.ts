// src/services/CompraService.ts

import HttpClient from './Client'; 
import { type CrearOrdenDto } from '../types/CrearOrdenDTO';

export type CrearOrdenResponse = {
    success: boolean;
    ordenId: number; 
    paymentUrl: string; 
};


class CompraService extends HttpClient {
    
    constructor() {
        super('/orden'); 
    }

    async crearOrden(payload: CrearOrdenDto): Promise<CrearOrdenResponse> {
        
        const respuesta = await super.post('', payload); 

        return {
            success: respuesta.success,
            ordenId: respuesta.ordenId,
            paymentUrl: respuesta.paymentUrl,
        };
    }
    
}

export default new CompraService();