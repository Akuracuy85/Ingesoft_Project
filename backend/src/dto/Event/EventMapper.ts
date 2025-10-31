// src/dto/Event/EventMapper.ts

import { Buffer } from 'buffer';
import { EventListResponseDTO } from './EventListResponseDTO';
import { EventDetailsForPurchaseDTO } from './EventDetailsForPurchaseDTO'; // <--- NUEVO DTO

// ----------------------------------------------------------------------
// --- DEFINICIONES DE TIPOS (INTERNAS AL MAPPER) ---
// Se utilizan para tipar las entidades que vienen del Service/Repository.
// ----------------------------------------------------------------------

interface ArtistEntity {
    nombre: string;
}

interface BufferData {
    type: 'Buffer';
    data: number[]; 
}

type BinaryData = Buffer | BufferData;

interface EventEntity {
    id: number;
    nombre: string;
    descripcion: string;
    fechaEvento: Date; // La entidad de DB todavía usa Date
    departamento: string;
    provincia: string;
    distrito: string;
    imagenBanner: BinaryData; 
    mimeType?: string; 
    artista: ArtistEntity;
}

// Tipo para las Zonas (asumiendo que vienen de la entidad Zona del ORM)
interface ZoneEntity {
    id: number;
    nombre: string;
    capacidad: number; // Aforo de la zona
    costo: number; // Precio
    cantidadComprada: number; // Entradas ya vendidas en esta zona
}

// Entidad extendida para el mapeo de Compra
interface EventEntityWithZones extends EventEntity {
    zonas: ZoneEntity[]; 
}

// ----------------------------------------------------------------------
// Función de Ayuda: Conversión de Buffer a Base64
// ----------------------------------------------------------------------

function bufferToBase64(binaryData: BinaryData, mimeType: string): string {
    
    if (!binaryData) return '';

    let buffer: Buffer;

    if (binaryData instanceof Buffer) {
        buffer = binaryData;
    } else if ('data' in binaryData && Array.isArray(binaryData.data)) {
        if (binaryData.data.length === 0) return '';
        buffer = Buffer.from(binaryData.data);
    } else {
        return '';
    }

    if (buffer.length === 0) return '';
    
    const base64String = buffer.toString('base64');
    
    return `data:${mimeType};base64,${base64String}`; 
}

// ----------------------------------------------------------------------
// Clase Mapeadora
// ----------------------------------------------------------------------

export class EventMapper {
    
    /**
     * Mapea la entidad de Evento a la estructura de la lista de eventos.
     */
    static toListDTO(entity: EventEntity): EventListResponseDTO {
        
        const eventDate = entity.fechaEvento;

        // 🎯 FORMATO DE FECHA: "21 de enero de 2025"
        const dateString = eventDate.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });

        // 🎯 FORMATO DE HORA: "HH:MM" 24h
        const timeString = eventDate.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        });
        
        // --- Otros Mapeos ---
        const place = `${entity.distrito}, ${entity.provincia}`;
        const mimeType = entity.mimeType || 'image/jpeg'; 
        const imageBase64 = bufferToBase64(entity.imagenBanner, mimeType);
        
        return {
            id: entity.id,
            title: entity.nombre,
            
            // Fecha y hora formateadas
            date: dateString, 
            time: timeString, 
            
            place: place, 
            image: imageBase64, 
            artistName: entity.artista.nombre,
        };
    }

    /**
     * @description Transforma la entidad Evento (con Zonas) a la estructura 
     * EventDetailsForPurchaseDTO, requerida para la vista de compra.
     * @param entity La entidad de Evento (incluyendo zonas)
     * @returns EventDetailsForPurchaseDTO.
     */
    static toPurchaseDTO(entity: EventEntityWithZones): EventDetailsForPurchaseDTO {
        
        const eventDate = entity.fechaEvento;
        const mimeType = entity.mimeType || 'image/jpeg'; 

        // 1. Mapeo de Propiedades Base (Mismos formatos que toListDTO)
        const dateString = eventDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeString = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
        const place = `${entity.distrito}, ${entity.provincia}`;
        const imageBase64 = bufferToBase64(entity.imagenBanner, mimeType);

        // 2. Mapeo de Zonas (Transformar ZoneEntity al DTO de Zona)
        const zonasDisponibles = entity.zonas.map(zona => ({
            id: zona.id,
            nombre: zona.nombre,
            capacidad: zona.capacidad,
            costo: zona.costo, // Precio
            cantidadComprada: zona.cantidadComprada, 
        }));
        
        // 3. Definición de límite de entradas
        const LIMITE_COMPRA_POR_PERSONA = 10; 
        
        return {
            id: entity.id,
            title: entity.nombre,
            description: entity.descripcion, 
            
            // Propiedades mapeadas
            date: dateString, 
            time: timeString, 
            place: place,
            image: imageBase64,
            artistName: entity.artista.nombre,
            
            // Propiedades específicas de Compra
            zonasDisponibles: zonasDisponibles, 
            limiteEntradas: LIMITE_COMPRA_POR_PERSONA,
        };
    }
}