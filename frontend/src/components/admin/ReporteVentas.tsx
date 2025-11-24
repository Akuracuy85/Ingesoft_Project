import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search, Calendar } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { useVentas } from "@/hooks/useVentas"

export function ReporteVentas() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showExportNotification, setShowExportNotification] = useState(false)

  const { ventas, loading, listarVentas } = useVentas()

  useEffect(() => {
    listarVentas()
  }, [])

  const handleExport = () => {
    setShowExportNotification(true)
    setTimeout(() => setShowExportNotification(false), 3000)
  }

  const filteredData = ventas.filter(
    (item) =>
      item.nombreEvento.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organizadorNombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Input type="date" className="flex-1" />
            <span className="text-muted-foreground">-</span>
            <Input type="date" className="flex-1" />
          </div>

          {/* Buscador */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por evento o organizador"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Exportaciones */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Notificación de exportación */}
      {showExportNotification && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          Archivo exportado correctamente
        </div>
      )}

      {/* Loading graph */}
      {loading ? (
        <p className="text-sm text-muted-foreground mb-6">Cargando ventas...</p>
      ) : (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
                formatter={(value: number) => `S/ ${value.toLocaleString()}`}
              />
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
            {filteredData.map((item) => (
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

            {!loading && filteredData.length === 0 && (
              <tr>
                <td className="py-4 text-center text-muted-foreground" colSpan={5}>
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right">
        <p className="text-xs text-muted-foreground">
          Actualizado automáticamente
        </p>
      </div>
    </Card>
  )
}
