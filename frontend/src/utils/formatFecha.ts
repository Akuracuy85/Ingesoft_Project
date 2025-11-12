// Función reutilizable para formatear una fecha en formato 'YYYY-MM-DD' (o 'YYYY-MM-DD HH:mm:ss') a 'dd/MM/yyyy'
// No usa el objeto Date para evitar desfases por zona horaria.
export function formatFecha(input: string): string {
  if (!input) return '';
  const ymd = input.trim().slice(0, 10); // toma solo 'YYYY-MM-DD' si viene con hora
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return input;
  return `${d}/${m}/${y}`;
}

