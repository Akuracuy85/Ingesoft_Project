export const tienePropiedad = (
  obj: unknown,
  propiedad: string
): obj is Record<string, unknown> => {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, propiedad);
};
