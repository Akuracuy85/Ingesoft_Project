// ./src/types/zone.ts (Corregido)

export interface Zone {
  // Propiedad única y clave para React 'key'
  id: number; 
  
  // El nombre de la zona, que en el backend es 'nombre'
  nombre: string; 
  
  // El costo/precio, que en el backend es 'costo'
  costo: number;
  
  // Otras propiedades que vienen en el DTO de zonasDisponibles
  capacidad: number;
  cantidadComprada: number;
}