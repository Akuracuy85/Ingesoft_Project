// src/utils/points.ts

/**
 * Calcula los puntos ganados o gastados según el subtotal y el tipo de flujo.
 *
 * @param subtotal - Monto total de la compra antes de aplicar puntos
 * @param isUsingPointsFlow - true si es compra con puntos (Preventa), false si es compra normal
 * @returns Cantidad de puntos ganados o gastados
 */
export function calcularPuntos(subtotal: number, isUsingPointsFlow: boolean): number {
  if (subtotal <= 0) return 0;

  const porcentajePuntosGanados = 0.1;  // 10%
  const porcentajePuntosGastados = 0.3; // 30%

  const porcentaje = isUsingPointsFlow
    ? porcentajePuntosGastados
    : porcentajePuntosGanados;

  return Math.round(subtotal * porcentaje);
}
