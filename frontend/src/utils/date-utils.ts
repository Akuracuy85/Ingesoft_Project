export function extractFecha(fechaEvento: string | Date): string {
  try {
    const d = typeof fechaEvento === "string" ? new Date(fechaEvento) : fechaEvento;
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function extractHora(fechaEvento: string | Date): string {
  try {
    const d = typeof fechaEvento === "string" ? new Date(fechaEvento) : fechaEvento;
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(11, 16);
  } catch {
    return "";
  }
}

// Verifica si la fecha en formato 'MM/AA' es válida y no está en el pasado
export function esFechaValida(fecha: string): boolean {
  const [mesStr, anioStr] = fecha.split("/");
  const mes = parseInt(mesStr, 10);
  const anio = parseInt(anioStr, 10) + 2000;
  const fechaActual = new Date();
  return !(anio < fechaActual.getFullYear() || (anio === fechaActual.getFullYear() && mes < fechaActual.getMonth() + 1));
}