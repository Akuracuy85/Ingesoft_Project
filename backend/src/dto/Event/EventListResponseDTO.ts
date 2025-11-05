// src/dto/Event/EventListResponseDTO.ts

// 💡 Asumimos que la 'Zona' del frontend es compatible con tu 'ZonaDto' del backend.
// Si no existe el import, añádelo (la ruta puede variar).
import { ZonaDto } from "../evento/ZonaDto"; 

export interface EventListResponseDTO {
    // Mapeado desde 'id'
    id: number; 
    // Mapeado desde 'nombre'
    title: string; 
    
    // --- CAMPOS AÑADIDOS ---
    description: string; // Mapeado desde 'descripcion'
    // ---

    // Mapeado desde 'fechaEvento' (solo la fecha)
    date: string; 
    // Mapeado desde 'fechaEvento' (solo la hora)
    time: string; 

    // --- CAMPOS AÑADIDOS ---
    departamento: string;
    provincia: string;
    distrito: string;
    // ---

    // Mapeado de (distrito, provincia, departamento)
    place: string; 
    // Mapeado de 'imagenBanner' (ya codificado a Base64)
    image: string; 
    // Mapeado de 'artista.nombre'
    artistName: string; // El frontend lo pide como 'artist', pero usa 'artistName'

    // --- CAMPOS AÑADIDOS ---
    category?: string; // Mapeado de 'artista.categoria.nombre'
    zonas: ZonaDto[]; // Mapeado de 'evento.zonas'
    // ---
}