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
  autorTexto?: string;
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
        fechaInicio: toUTCStart(filtros.fechaInicio),
        fechaFin: toUTCEnd(filtros.fechaFin),
        tipo: filtros.tipo,
      };
      const response = await adminAccionesService.obtenerAcciones(filtrosUTC);
      let lista = response.acciones ?? [];

      if (filtros.autorTexto && filtros.autorTexto.trim() !== "") {
        const q = filtros.autorTexto.toLowerCase();

        lista = lista.filter((acc) => {
          const nombre = acc.autor?.nombre?.toLowerCase() ?? "";
          const apellido = acc.autor?.apellido?.toLowerCase() ?? "";
          const completo = `${nombre} ${apellido}`;

          return (
            nombre.includes(q) ||
            apellido.includes(q) ||
            completo.includes(q)
          );
        });
      }

      setAcciones(lista);
    } catch (err) {
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
  };
}
