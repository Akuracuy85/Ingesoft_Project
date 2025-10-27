// src/data/mockZones.ts

// Importamos el tipo para asegurar que nuestros datos cumplen la estructura
import type { Zone } from "../types/Zone"; 

/**
 * Datos de prueba para las zonas del evento.
 */
export const mockZonesData: Zone[] = [
  { zona: "VIP", precio: 340 },
  { zona: "Campo A", precio: 240 },
  { zona: "Campo B", precio: 230 },
  { zona: "Norte", precio: 100 },
  { zona: "CONADIS", precio: 50 },
];