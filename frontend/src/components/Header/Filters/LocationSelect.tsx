import { useState } from "react";
import { CustomDropdown } from "../../CustomDropdown";
import { locationsMock } from "../../../data/locationsMock";
import type { Departamento, Provincia, Distrito } from "../../../models/ListLocations";

export const LocationSelect = () => {
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [provincia, setProvincia] = useState<Provincia | null>(null);
  const [distrito, setDistrito] = useState<Distrito | null>(null);

  // 🔹 Helper para insertar "Todos" al inicio
  const withTodos = <T extends { id: string; nombre: string }>(options: T[]) => [
    { id: "", nombre: "Todos" },
    ...options,
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Ubicación</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            {/* 🔸 Departamento */}
            <label className="text-sm text-gray-600 mb-1">Departamento</label>
            <CustomDropdown
              options={withTodos(locationsMock.departamentos)}
              value={departamento?.id || ""}
              onChange={(id) => {
                if (id === "") {
                  setDepartamento(null);
                  setProvincia(null);
                  setDistrito(null);
                  return;
                }
                const dep = locationsMock.departamentos.find((d) => d.id === id) || null;
                setDepartamento(dep);
                setProvincia(null);
                setDistrito(null);
              }}
            />
          </div>

          <div className="flex flex-col">
            {/* 🔸 Provincia */}
            <label className="text-sm text-gray-600 mb-1">Provincia</label>          
            <CustomDropdown
              options={withTodos(departamento?.provincias || [])}
              value={provincia?.id || ""}
              onChange={(id) => {
                if (id === "") {
                  setProvincia(null);
                  setDistrito(null);
                  return;
                }
                const prov = departamento?.provincias.find((p) => p.id === id) || null;
                setProvincia(prov);
                setDistrito(null);
              }}
              disabled={!departamento}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Distrito</label>        
            {/* 🔸 Distrito */}
            <CustomDropdown
              options={withTodos(provincia?.distritos || [])}
              value={distrito?.id || ""}
              onChange={(id) => {
                if (id === "") {
                  setDistrito(null);
                  return;
                }
                const dist = provincia?.distritos.find((d) => d.id === id) || null;
                setDistrito(dist);
              }}
              disabled={!provincia}
            />
          </div> 
        </div>
    </div>
  );
};