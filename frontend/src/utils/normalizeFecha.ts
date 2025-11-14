// Utilidad para normalizar fechas al formato YYYY-MM-DD para inputs type="date"
export const normalizeFecha = (fechaRaw: string | undefined | null): string => {
  if (!fechaRaw) return "";
  // Si ya viene como YYYY-MM-DD, la devolvemos tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaRaw)) return fechaRaw;
  // Si viene en formato ISO (con "T"), tomamos la parte de la fecha
  if (fechaRaw.includes("T")) {
    return fechaRaw.split("T")[0] ?? "";
  }
  try {
    const d = new Date(fechaRaw);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {
    // ignorar errores y devolver cadena vacía
  }
  return "";
};

