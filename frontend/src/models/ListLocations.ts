// src/models/ListLocations.ts

export interface Distrito {
  id: string;
  nombre: string;
}

export interface Provincia {
  id: string;
  nombre: string;
  distritos: Distrito[];
}

export interface Departamento {
  id: string;
  nombre: string;
  provincias: Provincia[];
}

export interface ListLocations {
  departamentos: Departamento[];
}
