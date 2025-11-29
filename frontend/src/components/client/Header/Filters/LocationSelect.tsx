// src/components/Filters/LocationSelect.tsx (SOLUCIÓN FINAL DE ERRORES)

import { useState, useEffect, useMemo } from 'react';
import { CustomDropdown } from "../../CustomDropdown";

import type { LocationType } from "../../../../types/LocationType";
import type { Option } from "../../CustomDropdown";

import MetadataService from '../../../../services/MetadataService';
import type { LocationOption } from '../../../../services/UbicacionService';

type LocationSelectProps = {
  value: LocationType;
  onChange: (value: LocationType) => void;
  departamentoOptions: LocationOption[];
};

export const LocationSelect = ({ value, onChange, departamentoOptions }: LocationSelectProps) => {
    const { departamento, provincia, distrito } = value;

    // Estados para almacenar las opciones de los dropdowns
    const [provincias, setProvincias] = useState<LocationOption[]>([]);
    const [distritos, setDistritos] = useState<LocationOption[]>([]);

    // Función para convertir las opciones al formato que espera CustomDropdown
    const withTodos = useMemo(() => (options: LocationOption[]): Option[] => {
        const mappedOptions: Option[] = options.map(opt => ({
            id: opt.nombre,
            nombre: opt.nombre
        }));
        return [{ id: "", nombre: "Todos" }, ...mappedOptions];
    }, []);

    // EFECTO 1: Cargar Provincias cuando cambia el DEPARTAMENTO
    useEffect(() => {
        // Si no hay un departamento seleccionado, limpiar las provincias y distritos
        if (!departamento) {
            setProvincias([]);
            setDistritos([]);
            return;
        }

        const deptObj = departamentoOptions.find(d => d.nombre === departamento);
        if (!deptObj) return;

        let isMounted = true;
        // Llamar al servicio para obtener las provincias del departamento seleccionado
        MetadataService.getProvincias(Number(deptObj.id))
            .then(data => {
                if (isMounted) {
                    setProvincias(data);
                    // Si la provincia seleccionada anteriormente no está en la nueva lista, se limpia
                    if (provincia && !data.some(p => p.nombre === provincia)) {
                        onChange({ ...value, provincia: null, distrito: null });
                    }
                }
            });

        return () => { isMounted = false; };
    }, [departamento, departamentoOptions]);

    // EFECTO 2: Cargar Distritos cuando cambia la PROVINCIA (o el departamento)
    useEffect(() => {
        // Si no hay provincia o departamento, limpiar los distritos
        if (!provincia || !departamento) {
            setDistritos([]);
            return;
        }

        const deptObj = departamentoOptions.find(d => d.nombre === departamento);
        const provObj = provincias.find(p => p.nombre === provincia);
        if (!deptObj || !provObj) return;

        let isMounted = true;
        // Llamar al servicio para obtener los distritos
        MetadataService.getDistritos(Number(deptObj.id), Number(provObj.id))
            .then(data => {
                if (isMounted) {
                    setDistritos(data);
                    // Si el distrito seleccionado anteriormente no está en la nueva lista, se limpia
                    if (distrito && !data.some(d => d.nombre === distrito)) {
                        onChange({ ...value, distrito: null });
                    }
                }
            });

        return () => { isMounted = false; };
    }, [provincia, departamento, provincias]);

    return (
        <div className="mb-6 min-w-0">
            <h3 className="text-lg font-medium mb-2 dark:text-gray-200">Ubicación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Departamento */}
                <div className="min-w-0">
                    <CustomDropdown
                        options={withTodos(departamentoOptions)}
                        value={departamento || ""}
                        menuMaxHeight="100px"
                        onChange={(id) => {
                            // Al cambiar de departamento, se resetean provincia y distrito
                            onChange({ departamento: id || null, provincia: null, distrito: null });
                        }}
                    />
                </div>

                {/* Provincia */}
                <div className="min-w-0">
                    <CustomDropdown
                        options={withTodos(provincias)}
                        value={provincia || ""}
                        menuMaxHeight="100px"
                        onChange={(id) => {
                            // Al cambiar de provincia, se resetea el distrito
                            onChange({ departamento, provincia: id || null, distrito: null });
                        }}
                        disabled={!departamento || provincias.length === 0}
                    />
                </div>

                {/* Distrito */}
                <div className="min-w-0">
                    <CustomDropdown
                        options={withTodos(distritos)}
                        value={distrito || ""}
                        menuMaxHeight="100px"
                        onChange={(id) => {
                            onChange({ departamento, provincia, distrito: id || null });
                        }}
                        disabled={!provincia || distritos.length === 0}
                    />
                </div>
            </div>
        </div>
    );
};