import { useEffect, useState, useCallback } from "react";
import { adminAccionesService } from "@/services/AdminAccionesService";
import type { Accion } from "@/models/Accion";

function toUTCStart(dateString?: string) {
  if (!dateString) return undefined;
  return `${dateString}T00:00:00Z`;
}

function toUTCEnd(dateString?: string) {
  if (!dateString) return undefined;
  return `${dateString}T23:59:59Z`;
}

interface FiltrosAccion {
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: string;
  autorId?: number;
}

export function useAccionesInternas() {
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosAccion>({});

  const fetchAcciones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filtrosUTC = {
        ...filtros,
        fechaInicio: toUTCStart(filtros.fechaInicio),
        fechaFin: toUTCEnd(filtros.fechaFin),
      };

      const response = await adminAccionesService.obtenerAcciones(filtrosUTC);
      setAcciones(response.acciones ?? []);
    } catch (err: any) {
      console.error("Error cargando acciones internas:", err);
      setError("No se pudieron cargar las acciones.");
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchAcciones();
  }, [fetchAcciones]);

  const actualizarFiltros = (nuevosFiltros: Partial<FiltrosAccion>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }));
  };

  return {
    acciones,
    isLoading,
    error,
    filtros,
    actualizarFiltros,
    fetchAcciones,
  };
}
