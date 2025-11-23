export function ConvertirFechaUTCaPeru(fechaUTC: Date): Date {
  return new Date(fechaUTC.getTime() - 5 * 60 * 60 * 1000);
}

export const FormatearFecha = (fecha: Date | string): string => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' ' + date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}