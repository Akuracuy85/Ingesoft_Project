import type { Zone } from "./Zone";
export interface Artist {
    id: number;
    nombre: string;
    // Otros campos relevantes del artista
}

export interface Event {
    id: number;
    title: string;          // Mapeado desde 'nombre'
    description: string;    // Mapeado desde 'descripcion'
    
    // ✅ CAMPOS CRÍTICOS DE FECHA Y HORA
    date: string;           // Parte de 'fechaEvento' (Ej: '2025-12-31')
    time: string;           // Parte de 'fechaEvento' (Ej: '20:00')

    // ✅ CAMPOS CRÍTICOS DE UBICACIÓN (Necesarios para filtros de LocationType)
    departamento: string;   // Mapeado desde el backend
    provincia: string;      // Mapeado desde el backend
    distrito: string;       // Mapeado desde el backend
    place: string;          // Mantenido para la vista (Ej: "Coliseo Arequipa")

    image: string;          // Mapeado desde 'imagenBanner' (asumiendo que se convierte a URL/base64)
    
    // ✅ CAMPO DE RELACIÓN PARA ARTISTA (Necesario para filtros de artists[])
    artist: Artist;         // Mapeado desde la relación 'artista' del backend

    // Asumiremos un campo para Categoría/Género si lo vas a filtrar
    category?: string;      // Si tu backend tiene este dato, agrégalo aquí.
    
    // Relaciones
    zonas: Zone[];

    //Administrar
    documento: string;
    estado: string;
    organizadorNombre: string;
}