// src/dto/Event/EventMapper.ts

import { Buffer } from 'buffer';
import { EventListResponseDTO } from './EventListResponseDTO';
import { EventDetailsForPurchaseDTO } from './EventDetailsForPurchaseDTO';
// 🚨 IMPORTAR la entidad Tarifa para compatibilidad con ZonaDTO y el ORM.
import { Tarifa } from "../../models/Tarifa"; 
// src/dto/Event/EventMapper.ts
import { TarifaDto } from "../evento/TarifaDto";
// ... otros imports
// ----------------------------------------------------------------------
// --- DEFINICIONES DE TIPOS (INTERNAS AL MAPPER) ---
// ----------------------------------------------------------------------

interface ArtistEntity {
    nombre: string;
    categoria?: CategoriaEntity;
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
    lugar: string;
    imagenBanner: BinaryData;
    imagenLugar: BinaryData;
    mimeType?: string; 
    artista: ArtistEntity;
}
interface CategoriaEntity { // <-- AÑADE ESTA INTERFAZ
    id: number;
    nombre: string;
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
    private static mapearTarifaDto(tarifa?: Tarifa | null): TarifaDto | null {
        if (!tarifa) {
            return null;
        }

        return {
            id: tarifa.id,
            nombre: tarifa.nombre,
            precio: tarifa.precio,
            fechaInicio: tarifa.fechaInicio.toISOString(),
            fechaFin: tarifa.fechaFin.toISOString(),
        };
    }
    static toListDTO(entity: EventEntityWithZones): EventListResponseDTO {

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
        
        //const place = `${entity.distrito}, ${entity.provincia}`;
        const place = entity.lugar;
        const mimeType = entity.mimeType || 'image/jpeg'; 
        const imageBase64 = bufferToBase64(entity.imagenBanner, mimeType);
        const imagePlaceBase64 = bufferToBase64(entity.imagenLugar, mimeType);
        const zonasDto = (entity.zonas || []).map(zona => ({
            id: zona.id,
            nombre: zona.nombre,
            capacidad: zona.capacidad,
            cantidadComprada: zona.cantidadComprada,
            
            // Usa la función de ayuda para mapear las tarifas
            tarifaNormal: this.mapearTarifaDto(zona.tarifaNormal), 
            tarifaPreventa: this.mapearTarifaDto(zona.tarifaPreventa)
        }));
                
        // 🚀 ESTO ESTABA FALTANDO (o mal ubicado)
        return {
            id: entity.id,
            title: entity.nombre,
            description: entity.descripcion, // <-- AÑADIDO
            date: dateString,
            time: timeString,
            departamento: entity.departamento, // <-- AÑADIDO
            provincia: entity.provincia, // <-- AÑADIDO
            distrito: entity.distrito, // <-- AÑADIDO
            place: place,
            image: imageBase64,
            imagePlace: imagePlaceBase64,
            artistName: entity.artista.nombre,
            category: entity.artista.categoria?.nombre, // <-- AÑADIDO
            zonas: zonasDto, // <-- AÑADIDO
            //placeEspecific: placeEspecific, // <-- AÑADIDO
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
        //const place = `${entity.distrito}, ${entity.provincia}`;
        const place = entity.lugar;
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
