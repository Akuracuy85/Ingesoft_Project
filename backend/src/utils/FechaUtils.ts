export function ConvertirFechaUTCaPeru(fechaUTC: Date, restar: number = 10): string {
  return (process.env.ENV == 'prod' ? fechaUTC : new Date(fechaUTC.getTime() - restar * 60 * 60 * 1000)).toISOString();
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