export function ConvertirFechaUTCaPeru(fechaUTC: Date): Date {
  return new Date(fechaUTC.getTime() - 5 * 60 * 60 * 1000);
}