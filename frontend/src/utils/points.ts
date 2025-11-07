// src/utils/points.ts
export function calcularPuntos(subtotal: number, isUsingPointsFlow: boolean): number {
  if (subtotal <= 0) return 0;
  return isUsingPointsFlow
    ? Math.floor(subtotal / 10)       // Gastar puntos
    : Math.floor(subtotal / 10 / 2);  // Ganar puntos
}
