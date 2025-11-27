import { useState } from "react";
import { adminVentasService, type FiltroVentas } from "@/services/AdminVentasService";
import type { AdminVenta } from "@/types/Venta";

function toUTCStart(dateString?: string) {
  if (!dateString) return undefined;
  return `${dateString}T00:00:00Z`;
}

function toUTCEnd(dateString?: string) {
  if (!dateString) return undefined;
  return `${dateString}T23:59:59Z`;
}

export function useVentas() {
  const [ventas, setVentas] = useState<AdminVenta[]>([]);
  const [loading, setLoading] = useState(false);

  const listarVentas = async (filtros: FiltroVentas = {}) => {
    try {
      setLoading(true);

      const filtrosUTC = {
        ...filtros,
        fechaInicio: toUTCStart(filtros.fechaInicio),
        fechaFin: toUTCEnd(filtros.fechaFin),
      };

      const data = await adminVentasService.listarEventosAdmin(filtrosUTC);
      setVentas(data);
    } finally {
      setLoading(false);
    }
  };

  return {
    ventas,
    loading,
    listarVentas,
  };
}
