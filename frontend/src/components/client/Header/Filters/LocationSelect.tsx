// src/components/Filters/LocationSelect.tsx (SOLUCIÓN FINAL DE ERRORES)

import { useState, useEffect, useMemo } from 'react'; 
import { CustomDropdown } from "../../CustomDropdown";

import type { LocationType } from "../../../../types/LocationType";
import type { Option } from "../../CustomDropdown"; // El tipo Option usa { id: string, nombre: string }

import MetadataService from '../../../../services/MetadataService'; 
import type { LocationOption } from '../../../../services/UbicacionService';


type LocationSelectProps = {
  value: LocationType;
  onChange: (value: LocationType) => void;
  departamentoOptions: LocationOption[]; 
};

export const LocationSelect = ({ value, onChange, departamentoOptions }: LocationSelectProps) => {
    const { departamento, provincia, distrito } = value;
    
    // 🛑 SOLUCIÓN ERROR 1: Declarar estados primero
    const [provincias, setProvincias] = useState<LocationOption[]>([]);
    const [distritos, setDistritos] = useState<LocationOption[]>([]);

    // OBTENER OBJETOS COMPLETOS (USANDO LOS ID/NOMBRES GUARDADOS)
    const selectedDepartamento = useMemo(() => 
        departamentoOptions.find(d => d.id === departamento)
    , [departamento, departamentoOptions]);
      
    // 🛑 CORRECCIÓN DE ERROR 1: 'provincias' se usa aquí DESPUÉS de su declaración
    const selectedProvincia = useMemo(() => 
        provincias.find(p => p.id === provincia)
    , [provincia, provincias]);


    // 🛑 SOLUCIÓN ERROR 2 & 3: Tipo 'LocationOption' no asignable a 'Option'
    // La función mapea LocationOption[] a Option[] forzando el 'id' a string.
    // Asumimos que CustomDropdown siempre espera { id: string, nombre: string }
    const withTodos = useMemo(() => (options: LocationOption[]): Option[] => {
        const mappedOptions: Option[] = options.map(opt => ({
            // Forzamos el ID a string, resolviendo el error de tipo.
            id: String(opt.id), 
            nombre: opt.nombre 
        }));

        return [{ id: "", nombre: "Todos" }, ...mappedOptions];
    }, []);


    // EFECTO 1: Carga Provincias (Solo depende del DEPARTAMENTO)
    useEffect(() => {
        if (!selectedDepartamento) {
            setProvincias([]);
            setDistritos([]);
            return;
        }
        
        MetadataService.getProvincias(selectedDepartamento.nombre) 
            .then(data => {
                setProvincias(data);
                
                if (provincia && !data.some(p => p.id === provincia)) {
                    onChange({ departamento, provincia: null, distrito: null }); 
                }
            })
            .catch(err => {
                console.error("Error al cargar provincias:", err);
                setProvincias([]);
            });
            
    }, [selectedDepartamento, onChange, departamento, provincia]); 


    // EFECTO 2: Carga Distritos (Depende de Provincia y Departamento)
    useEffect(() => {
        if (!selectedProvincia || !selectedDepartamento) {
            setDistritos([]);
            return;
        }

        MetadataService.getDistritos(selectedDepartamento.nombre, selectedProvincia.nombre)
            .then(data => {
                setDistritos(data);

                if (distrito && !data.some(d => d.id === distrito)) {
                    onChange({ departamento, provincia, distrito: null });
                }
            })
            .catch(err => {
                console.error("Error al cargar distritos:", err);
                setDistritos([]);
            });

    }, [selectedProvincia, selectedDepartamento, onChange, departamento, provincia, distrito]);


    return (
        <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 dark:text-gray-200">Ubicación</h3>
            <div className="grid grid-cols-3 gap-4">

                {/* Departamento */}
                <CustomDropdown
                    options={withTodos(departamentoOptions)} 
                    value={departamento || ""}
                    onChange={(id) => {
                        onChange({ departamento: id || null, provincia: null, distrito: null });
                    }}
                />

                {/* Provincia */}
                <CustomDropdown
                    options={withTodos(provincias)} 
                    value={provincia || ""}
                    onChange={(id) => {
                        onChange({ departamento, provincia: id || null, distrito: null });
                    }}
                    disabled={!departamento || provincias.length === 0} 
                />

                {/* Distrito */}
                <CustomDropdown
                    options={withTodos(distritos)} 
                    value={distrito || ""}
                    onChange={(id) => {
                        onChange({ departamento, provincia, distrito: id || null });
                    }}
                    disabled={!provincia || distritos.length === 0}
                />
            </div>
        </div>
    );
};