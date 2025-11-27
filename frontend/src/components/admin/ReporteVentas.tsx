import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search, Calendar, X } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import NotificationService from "@/services/NotificationService"
import { useVentas } from "@/hooks/useVentas"
import { adminVentasService } from "@/services/AdminVentasService"

export function ReporteVentas() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  const [showExportNotification, setShowExportNotification] = useState(false)

  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 10

  const { ventas, loading, listarVentas } = useVentas()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div
        className="
        p-3 rounded-md border
        bg-white text-foreground
        shadow-sm
        dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100
      "
      >
        <p className="font-medium">{label}</p>
        <p className="text-sm text-[#D59B2C]">
          ventas : S/ {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  };


  useEffect(() => {
    listarVentas()
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(handler)
  }, [searchQuery])

  useEffect(() => {
    const query = debouncedQuery.trim()

    if (query === "") {
      listarVentas({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined
      })
      setPaginaActual(1)
      return
    }

    listarVentas({
      nombreEvento: query,
      nombreOrganizador: query,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined
    })

    setPaginaActual(1)
  }, [debouncedQuery])

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      listarVentas({
        fechaInicio,
        fechaFin,
        nombreEvento: debouncedQuery || undefined,
        nombreOrganizador: debouncedQuery || undefined
      })
      setPaginaActual(1)
    }
  }, [fechaInicio, fechaFin])

  const handleExport = async () => {
    try {
      const filtros = {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        nombreEvento: debouncedQuery || undefined,
        nombreOrganizador: debouncedQuery || undefined,
      }

      const blob = await adminVentasService.exportarReporteVentas(filtros)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const fechaStr = new Date().toISOString().split("T")[0]
      link.setAttribute("download", `Reporte_Ventas_${fechaStr}.pdf`)

      document.body.appendChild(link)
      link.click()

      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)

      setShowExportNotification(true)
      setTimeout(() => setShowExportNotification(false), 3000)
    } catch (error) {
      console.error("Error al exportar:", error)
      NotificationService.error("La exportación no se ha realizado.")
    }
  }


  const limpiarFiltros = () => {
    setFechaInicio("")
    setFechaFin("")
    setSearchQuery("")
    setDebouncedQuery("")
    setPaginaActual(1)
    listarVentas({})
  }

  const totalPaginas = Math.ceil(ventas.length / itemsPorPagina)

  const paginaDatos = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina
    return ventas.slice(inicio, inicio + itemsPorPagina)
  }, [paginaActual, ventas])

  const salesData = ventas.map((v) => ({
    name: v.nombreEvento,
    ventas: v.gananciaTotal,
  }))

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Reporte de ventas por evento
        </h2>

        <div className="flex flex-wrap gap-3">
          {/* Fechas */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Calendar className="h-4 w-4 text-muted-foreground" />

            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="flex-1"
            />

            <span className="text-muted-foreground">-</span>

            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Buscador */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Buscar por evento u organizador"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPaginaActual(1)
              }}
              className="pl-9"
            />
          </div>

          {/* Botón limpiar */}
          <Button
            variant="destructive"
            className="gap-2"
            onClick={limpiarFiltros}
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>

          {/* Export */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Notificación export */}
      {showExportNotification && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          Archivo exportado correctamente
        </div>
      )}

      {/* Gráfico */}
      {!loading && (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ventas" fill="#D59B2C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Evento
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Entradas vendidas
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Ingresos totales (S/.)
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Fecha del evento
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Organizador
              </th>
            </tr>
          </thead>

          <tbody>
            {paginaDatos.map((item) => (
              <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4 text-sm font-medium text-foreground">
                  {item.nombreEvento}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {item.entradasVendidas.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  S/ {item.gananciaTotal.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {item.fechaEvento.split("T")[0]}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {item.organizadorNombre}
                </td>
              </tr>
            ))}

            {!loading && paginaDatos.length === 0 && (
              <tr>
                <td className="py-4 text-center text-muted-foreground" colSpan={5}>
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✔️ Paginación */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual(paginaActual - 1)}
        >
          Anterior
        </Button>

        <p className="text-sm text-muted-foreground">
          Página {paginaActual} de {totalPaginas || 1}
        </p>

        <Button
          variant="outline"
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          onClick={() => setPaginaActual(paginaActual + 1)}
        >
          Siguiente
        </Button>
      </div>
    </Card>
  )
}
