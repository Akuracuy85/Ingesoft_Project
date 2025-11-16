import { useState } from "react"
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

const salesData = [
  { name: "Concierto Rock", ventas: 42500 },
  { name: "Festival Jazz", ventas: 28000 },
  { name: "Noche de Salsa", ventas: 15600 },
]

const tableData = [
  {
    id: 1,
    evento: "Concierto Rock 2025",
    entradas: 850,
    ingresos: 42500,
    fecha: "15/03/25",
    organizador: "Juan Pérez",
  },
  {
    id: 2,
    evento: "Festival de Jazz",
    entradas: 560,
    ingresos: 28000,
    fecha: "20/04/25",
    organizador: "María García",
  },
  {
    id: 3,
    evento: "Noche de Salsa",
    entradas: 312,
    ingresos: 15600,
    fecha: "10/05/25",
    organizador: "Carlos López",
  },
]

export function ReporteVentas() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showExportNotification, setShowExportNotification] = useState(false)

  const handleExport = (/*format: string*/) => {
    setShowExportNotification(true)

    setTimeout(() => setShowExportNotification(false), 3000)
  }

  const filteredData = tableData.filter(
    (item) =>
      item.evento.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organizador.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Button variant="outline" onClick={() => handleExport(/*"CSV"*/)} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport(/*"PDF"*/)} className="gap-2">
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

      {/* Gráfico */}
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
                  {item.evento}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {item.entradas.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  S/ {item.ingresos.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {item.fecha}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {item.organizador}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right">
        <p className="text-xs text-muted-foreground">
          Actualizado el 05/10/2025 a las 10:30 a.m.
        </p>
      </div>
    </Card>
  )
}
