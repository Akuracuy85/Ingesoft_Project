// src/hooks/useMetadata.ts

import { useState, useEffect } from 'react';
import MetadataService from '../services/MetadataService';
import type { LocationOption } from '../services/UbicacionService';

export interface FilterOption {
    id: string | number; // O number, si el backend usa IDs numéricos
    nombre: string;
}

interface MetadataResult {
    categorias: FilterOption[];
    artistas: FilterOption[];
    departamentos: LocationOption[];
    isLoadingMetadata: boolean;
}

export const useMetadata = (): MetadataResult => {
    const [categorias, setCategorias] = useState<FilterOption[]>([]);
    const [artistas, setArtistas] = useState<FilterOption[]>([]);
    const [departamentos, setDepartamentos] = useState<LocationOption[]>([]);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

    useEffect(() => {
        const fetchAllMetadata = async () => {
            setIsLoadingMetadata(true);
            try {
                // Ejecutamos todas las llamadas de metadatos en paralelo para eficiencia
                const [cats, arts, deps] = await Promise.all([
                    MetadataService.getCategorias(),
                    MetadataService.getArtistas(),
                    MetadataService.getDepartamentos()
                ]);

                setCategorias(cats);
                setArtistas(arts);
                setDepartamentos(deps);

            } catch (error) {
                console.error("Fallo la carga de metadatos:", error);
            } finally {
                setIsLoadingMetadata(false);
            }
        };

        fetchAllMetadata();
    }, []); // Se ejecuta solo una vez al montar

    return { categorias, artistas, departamentos, isLoadingMetadata };
};