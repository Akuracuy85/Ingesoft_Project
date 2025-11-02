// src/models/Event.ts

export interface ZonaTarifa {
  id: number;
  nombre: string;
  tarifas: { tipo: string; precio: number }[];
}

export interface Event {
  id: number;
  title: string;
  date: string;
  place: string;
  image: string;
  time: string;

  zonas?: ZonaTarifa[];
}