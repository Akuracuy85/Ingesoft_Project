// ./src/types/zone.ts (Tipo que consume la tabla de zonas)
// Importar Tarifa y ZonePurchaseDetail NO es necesario aquí, solo si vas a re-calcular.

export interface Zone {
  id: number; 
  nombre: string; 
  
  // 🚨 REQUERIDO: El campo 'costo' debe seguir aquí para que ZoneTable funcione.
  // Lo calcularemos al mapear la data del backend.
  costo: number; 
  
  capacidad: number;
  cantidadComprada: number;
  
  // Opcional: Podrías añadir las tarifas aquí si ZoneTable las necesitara directamente, 
  // pero mantendremos este tipo simple.
}