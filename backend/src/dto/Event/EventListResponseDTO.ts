export interface EventListResponseDTO {
    // Mapeado desde 'id'
    id: number; 
    // Mapeado desde 'nombre'
    title: string; 
    // Mapeado desde 'fechaEvento' (solo la fecha)
    date: string; 
    // Mapeado desde 'fechaEvento' (solo la hora)
    time: string; 
    // Mapeado de (distrito, provincia, departamento)
    place: string; 
    // Mapeado de 'imagenBanner' (ya codificado a Base64)
    image: string; 
    // Mapeado de 'artista.nombre'
    artistName: string;
}