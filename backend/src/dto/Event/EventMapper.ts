// src/dto/Event/EventMapper.ts

import { Buffer } from 'buffer';
import { EventListResponseDTO } from './EventListResponseDTO';
import { EventDetailsForPurchaseDTO } from './EventDetailsForPurchaseDTO';
// 🚨 IMPORTAR la entidad Tarifa para compatibilidad con ZonaDTO y el ORM.
import { Tarifa } from "../../models/Tarifa"; 

// ----------------------------------------------------------------------
// --- DEFINICIONES DE TIPOS (INTERNAS AL MAPPER) ---
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
    fechaEvento: Date;
    departamento: string;
    provincia: string;
    distrito: string;
    imagenBanner: BinaryData; 
    mimeType?: string; 
    artista: ArtistEntity;
}

// Usamos la entidad Tarifa importada para tipar las relaciones.
interface ZoneEntity {
    id: number;
    nombre: string;
    capacidad: number;
    cantidadComprada: number;
    tarifaNormal: Tarifa | null; 
    tarifaPreventa: Tarifa | null; 
}

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
     * @description Mapea la entidad de Evento a la estructura de la lista de eventos.
     */
    static toListDTO(entity: EventEntity): EventListResponseDTO {
                
        const eventDate = entity.fechaEvento;

        const dateString = eventDate.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });

        const timeString = eventDate.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        });
                
        const place = `${entity.distrito}, ${entity.provincia}`;
        const mimeType = entity.mimeType || 'image/jpeg'; 
        const imageBase64 = bufferToBase64(entity.imagenBanner, mimeType);
                
        // 🚀 ESTO ESTABA FALTANDO (o mal ubicado)
        return {
            id: entity.id,
            title: entity.nombre,
            date: dateString, 
            time: timeString, 
            place: place, 
            image: imageBase64, 
            artistName: entity.artista.nombre,
        };
    }

    /**
     * @description Transforma la entidad Evento (con Zonas y Tarifas) a la estructura 
     * EventDetailsForPurchaseDTO.
     */
    static toPurchaseDTO(entity: EventEntityWithZones): EventDetailsForPurchaseDTO {
                
        const eventDate = entity.fechaEvento;
        const mimeType = entity.mimeType || 'image/jpeg'; 

        // 1. Mapeo de Propiedades Base
        const dateString = eventDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeString = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
        const place = `${entity.distrito}, ${entity.provincia}`;
        const imageBase64 = bufferToBase64(entity.imagenBanner, mimeType);

        // 2. Mapeo de Zonas (Transformar ZoneEntity al DTO de Zona)
        const zonasDisponibles = entity.zonas.map(zona => ({
            id: zona.id,
            nombre: zona.nombre,
            capacidad: zona.capacidad,
            
            // ✅ Mapeamos solo las tarifas.
            tarifaNormal: zona.tarifaNormal, 
            tarifaPreventa: zona.tarifaPreventa, 
            
            cantidadComprada: zona.cantidadComprada, 
        }));
                
        // 3. Definición de límite de entradas
        const LIMITE_COMPRA_POR_PERSONA = 10; 
                
        return {
            id: entity.id,
            title: entity.nombre,
            description: entity.descripcion, 
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

// 🛑 ELIMINADA: Esta línea estaba fuera de la clase y causando problemas.
// const imageBase64 = bufferToBase64(entity.imagenBanner, mimeType);