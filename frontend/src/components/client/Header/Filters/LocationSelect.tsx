// src/components/Filters/LocationSelect.tsx (VERSIÓN FINAL DINÁMICA)

import { useState, useEffect, useMemo } from 'react'; 
import { CustomDropdown } from "../../CustomDropdown";
// import { locationsMock } from "../../../../data/locationsMock"; // 🛑 ELIMINADO

import type { LocationType } from "../../../../types/LocationType";


import type { Option } from "../../CustomDropdown";

// 🛑 Importar el servicio y las interfaces de opciones de ubicación
import MetadataService, { type LocationOption } from '../../../../services/MetadataService'; 


// 🛑 INTERFAZ DE PROPS CORREGIDA
type LocationSelectProps = {
  value: LocationType;
  onChange: (value: LocationType) => void;
  // Propiedad esperada desde FilterModal
  departamentoOptions: LocationOption[]; 
};

export const LocationSelect = ({ value, onChange, departamentoOptions }: LocationSelectProps) => {
  const { departamento, provincia, distrito } = value;

  // 🛑 ESTADOS LOCALES para datos en cascada
  const [provincias, setProvincias] = useState<LocationOption[]>([]);
  const [distritos, setDistritos] = useState<LocationOption[]>([]);

  // Función para agregar la opción "Todos" (memoizada)
  const withTodos = useMemo(() => (options: LocationOption[]): Option[] => (
    [{ id: "", nombre: "Todos" }, ...options]
  ), []);


  // 🛑 EFECTO 1: Carga Provincias cuando cambia el Departamento
  useEffect(() => {
    // Si no hay departamento, reseteamos las listas dependientes
    if (!departamento) {
      setProvincias([]);
      setDistritos([]);
      return;
    }
    
    // Llamada al servicio
    MetadataService.getProvincias(departamento)
      .then(data => {
        setProvincias(data);
        // Reseteamos provincia y distrito si los valores actuales no existen en la nueva lista
        if (provincia && !data.some(p => p.id === provincia)) {
           onChange({ departamento, provincia: null, distrito: null });
        }
      })
      .catch(err => {
        console.error("Error al cargar provincias:", err);
        setProvincias([]);
      });
      
  }, [departamento]); 

  // 🛑 EFECTO 2: Carga Distritos cuando cambia la Provincia
  useEffect(() => {
    // Si no hay provincia, reseteamos distritos
    if (!provincia) {
      setDistritos([]);
      return;
    }

    // Llamada al servicio
    MetadataService.getDistritos(provincia)
      .then(data => {
        setDistritos(data);
        // Reseteamos distrito si el valor actual no existe en la nueva lista
        if (distrito && !data.some(d => d.id === distrito)) {
          onChange({ departamento, provincia, distrito: null });
        }
      })
      .catch(err => {
        console.error("Error al cargar distritos:", err);
        setDistritos([]);
      });

  }, [provincia]);


  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Ubicación</h3>
      <div className="grid grid-cols-3 gap-4">

        {/* Departamento */}
        <CustomDropdown
          options={withTodos(departamentoOptions)} // 🛑 DATO DINÁMICO
          value={departamento || ""}
          onChange={(id) => {
            onChange({ departamento: id || null, provincia: null, distrito: null });
          }}
        />

        {/* Provincia */}
        <CustomDropdown
          options={withTodos(provincias)} // 🛑 DATO DINÁMICO
          value={provincia || ""}
          onChange={(id) => {
            onChange({ departamento, provincia: id || null, distrito: null });
          }}
          // Deshabilitado si no hay departamento O si la lista de provincias está vacía
          disabled={!departamento || provincias.length === 0} 
        />

        {/* Distrito */}
        <CustomDropdown
          options={withTodos(distritos)} // 🛑 DATO DINÁMICO
          value={distrito || ""}
          onChange={(id) => {
            onChange({ departamento, provincia, distrito: id || null });
          }}
          // Deshabilitado si no hay provincia O si la lista de distritos está vacía
          disabled={!provincia || distritos.length === 0}
        />
      </div>
    </div>
  );
};