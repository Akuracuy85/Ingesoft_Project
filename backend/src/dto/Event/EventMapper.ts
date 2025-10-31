import { Buffer } from 'buffer';
import { EventListResponseDTO } from './EventListResponseDTO';

// --- DEFINICIONES DE TIPOS (INTERNAS AL MAPPER) ---

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
}