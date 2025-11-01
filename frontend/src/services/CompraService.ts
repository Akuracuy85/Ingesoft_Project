// src/services/CompraService.ts

// Importaciones necesarias (ajusta las rutas según tu estructura de carpetas)
import HttpClient from './Client'; 
import { type CrearOrdenDto } from '../types/CrearOrdenDTO';

// --- Definición del Tipo de Respuesta del Backend ---
export type CrearOrdenResponse = {
    // ID de la orden creada en el backend
    ordenId: number; 
    // URL de la pasarela de pago a la que el frontend debe redirigir al usuario
    paymentUrl: string; 
};

// --- Clase del Servicio ---
class CompraService extends HttpClient {
    
    constructor() {
        // Inicializa HttpClient con la ruta base de la entidad '/orden'
        // (Esto establece la baseURL del cliente Axios a algo como /api/orden)
        super('/orden'); 
    }

    /**
     * @description Envía el DTO de la orden de compra al backend.
     */
    async crearOrden(payload: CrearOrdenDto): Promise<CrearOrdenResponse> {
        
        // 🛑 CORRECCIÓN CLAVE: Pasamos una ruta vacía ('' o sin argumento).
        // Esto asegura que la URL final sea exactamente http://localhost:3000/api/orden,
        // eliminando el slash sobrante que causaba el 404.
        const respuesta = await super.post('', payload); 

        // Asumiendo que el backend devuelve un objeto con la estructura que tiene los campos
        return {
            ordenId: respuesta.ordenId,
            paymentUrl: respuesta.paymentUrl,
        };
    }
    
    // Aquí puedes añadir otros métodos como obtenerDetalleOrden, etc.
}

// Exporta una instancia única (Singleton) del servicio
export default new CompraService();