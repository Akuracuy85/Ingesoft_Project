import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generarColorDesdeTipo } from "@/utils/generarColorDesdeTipo"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Download, Calendar } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

import { useAccionesInternas } from "@/hooks/useAccionesInternas"

export function ReporteAcciones() {
  const { acciones, isLoading, error, actualizarFiltros } = useAccionesInternas()

  const [actionType, setActionType] = useState("all")
  const [showExportNotification, setShowExportNotification] = useState(false)

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 10

  const handleExport = () => {
    setShowExportNotification(true)
    setTimeout(() => setShowExportNotification(false), 3000)
  }

  const handleChangeTipo = (tipo: string) => {
    setActionType(tipo)
    actualizarFiltros({ tipo: tipo === "all" ? undefined : tipo })
    setPaginaActual(1)
  }

  const totalPaginas = Math.ceil(acciones.length / itemsPorPagina)

  const filteredData = acciones.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  )

  const actionDistribution = useMemo(() => {
    return acciones.reduce(
      (acc: { name: string; value: number; color: string }[], a) => {
        const existing = acc.find((x) => x.name === a.tipo)

        if (existing) {
          existing.value += 1
        } else {
          acc.push({
            name: a.tipo,
            value: 1,
            color: generarColorDesdeTipo(a.tipo),
          })
        }
        return acc
      },
      []
    )
  }, [acciones])


  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Acciones internas del sistema
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Registro de actividades realizadas por administradores y organizadores.
        </p>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          {/* Fecha */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />

            <Input
              type="date"
              className="w-[180px]"
              onChange={(e) => {
                actualizarFiltros({ fechaInicio: e.target.value })
                setPaginaActual(1)
              }}
            />
          </div>

          {/* Selector de tipo */}
          <Select value={actionType} onValueChange={handleChangeTipo}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Tipo de acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              <SelectItem value="APROBAR EVENTO">Aprobar evento</SelectItem>
              <SelectItem value="CANCELAR EVENTO">Cancelar evento</SelectItem>
              <SelectItem value="ACTIVAR USUARIO">Activar usuario</SelectItem>
              <SelectItem value="DESACTIVAR USUARIO">Desactivar usuario</SelectItem>
              <SelectItem value="GENERAR REPORTE DE ACCIONES">Generar reporte acciones</SelectItem>
              <SelectItem value="GENERAR REPORTE DE Ventas">Generar reporte ventas</SelectItem>
            </SelectContent>
          </Select>
          {/* Buscador por usuario */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por usuario (ej. Raúl, Malaver, Raúl Malaver)"
              onChange={(e) => {
                actualizarFiltros({ autorTexto: e.target.value });
                setPaginaActual(1);
              }}
              className="w-full"
            />
          </div>

          {/* Exportar */}
          <Button variant="outline" onClick={handleExport} className="gap-2 ml-auto">
            <Download className="h-4 w-4" />
            Exportar log
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground mb-4">Cargando acciones...</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Notificación export */}
      {showExportNotification && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          Archivo exportado correctamente
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Fecha
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Usuario
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Rol
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Acción realizada
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Tipo
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4 text-sm text-foreground">
                  {new Date(item.fechaHora).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-foreground">
                  {item.autor?.nombre} {item.autor?.apellido}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                    {item.autor?.rol ?? "N/A"}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-foreground">{item.descripcion}</td>
                <td className="py-3 px-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.tipo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
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
      </div>

      {/* Pie Chart */}
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Distribución de acciones por tipo
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={actionDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {actionDistribution.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
