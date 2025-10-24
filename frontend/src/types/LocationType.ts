// Objeto plano que guarda solo IDs seleccionadas
export type LocationType = {
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
};

// Opcional: para los dropdowns
export type Option = {
  id: string;
  nombre: string;
};