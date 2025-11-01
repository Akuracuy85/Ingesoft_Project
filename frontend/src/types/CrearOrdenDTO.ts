// types/ordenes.ts o types/CrearOrdenDto.ts

/**
 * @interface CrearOrdenItemDto
 * Estructura de cada item de compra (entradas) por zona.
 */
export interface CrearOrdenItemDto {
  /**
   * El ID de la zona para la cual se compran las entradas.
   */
  zonaId: number;

  /**
   * Lista de DNI/identificaciones de las personas que usarán las entradas.
   * La longitud de este array determina la cantidad de entradas.
   */
  dnis: string[];
}

// -------------------------------------------------------------

/**
 * @interface CrearOrdenDto
 * DTO principal enviado por el frontend para iniciar una orden de compra.
 * Debe coincidir con el payload JSON que espera el backend.
 */
export interface CrearOrdenDto {
  /**
   * El ID único del evento al que se compran las entradas.
   */
  eventoId: number;

  /**
   * Lista de los ítems de compra, detallados por zona.
   */
  items: CrearOrdenItemDto[];
}