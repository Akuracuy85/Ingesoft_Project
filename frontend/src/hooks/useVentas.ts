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

      if (!filtros.nombreEvento && !filtros.nombreOrganizador) {
        const data = await adminVentasService.listarEventosAdmin(filtrosUTC);
        setVentas(data);
        return data;
      }

      const query =
        filtros.nombreEvento ??
        filtros.nombreOrganizador ??
        "";

      const [porEvento, porOrganizador] = await Promise.all([
        adminVentasService.listarEventosAdmin({
          ...filtrosUTC,
          nombreEvento: query,
          nombreOrganizador: undefined,
        }),
        adminVentasService.listarEventosAdmin({
          ...filtrosUTC,
          nombreEvento: undefined,
          nombreOrganizador: query,
        }),
      ]);
      const combinados: AdminVenta[] = [
        ...porEvento,
        ...porOrganizador.filter((ev) => !porEvento.some((e) => e.id === ev.id)),
      ];

      setVentas(combinados);
      return combinados;

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
