import { useState } from "react";
import { adminVentasService, type FiltroVentas } from "@/services/AdminVentasService";
import type { AdminVenta } from "@/types/Venta";

export function useVentas() {
  const [ventas, setVentas] = useState<AdminVenta[]>([]);
  const [loading, setLoading] = useState(false);

  const listarVentas = async (filtros: FiltroVentas = {}) => {
    try {
      setLoading(true);
      const data = await adminVentasService.listarEventosAdmin(filtros);
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
