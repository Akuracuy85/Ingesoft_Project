// src/data/locationsMock.ts
import type { ListLocations } from "../models/ListLocations";

export const locationsMock: ListLocations = {
  departamentos: [
    {
      id: "dep1",
      nombre: "Lima",
      provincias: [
        {
          id: "prov1",
          nombre: "Lima Metropolitana",
          distritos: [
            { id: "dist1", nombre: "Miraflores" },
            { id: "dist2", nombre: "San Isidro" },
            { id: "dist3", nombre: "Surco" },
            { id: "dist4", nombre: "Barranco" },
          ],
        },
        {
          id: "prov2",
          nombre: "Huaral",
          distritos: [
            { id: "dist5", nombre: "Chancay" },
            { id: "dist6", nombre: "Aucallama" },
          ],
        },
      ],
    },
    {
      id: "dep2",
      nombre: "Cusco",
      provincias: [
        {
          id: "prov3",
          nombre: "Cusco",
          distritos: [
            { id: "dist7", nombre: "San Blas" },
            { id: "dist8", nombre: "Santiago" },
          ],
        },
      ],
    },
  ],
};