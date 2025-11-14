// Utilidades de fecha/hora específicas para eventos
// Extraídas desde EventoService; lógica mantenida exactamente igual.

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

