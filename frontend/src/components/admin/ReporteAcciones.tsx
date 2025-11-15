"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

const auditData = [
  {
    id: 1,
    fecha: "02/10/25 15:23",
    usuario: "Admin01",
    rol: "Administrador",
    accion: 'Aprobó evento "Rock 2025"',
    resultado: "Éxito",
    tipo: "Aprobación",
  },
  {
    id: 2,
    fecha: "01/10/25 09:15",
    usuario: "Juan Pérez",
    rol: "Organizador",
    accion: "Subió documento",
    resultado: "Éxito",
    tipo: "Creación",
  },
  {
    id: 3,
    fecha: "30/09/25 14:45",
    usuario: "Admin02",
    rol: "Administrador",
    accion: 'Rechazó evento "Festival Verano"',
    resultado: "Éxito",
    tipo: "Rechazo",
  },
  {
    id: 4,
    fecha: "29/09/25 11:20",
    usuario: "María García",
    rol: "Organizador",
    accion: "Editó información del evento",
    resultado: "Éxito",
    tipo: "Edición",
  },
  {
    id: 5,
    fecha: "28/09/25 16:30",
    usuario: "Admin01",
    rol: "Administrador",
    accion: "Inició sesión",
    resultado: "Éxito",
    tipo: "Inicio de sesión",
  },
]

const actionDistribution = [
  { name: "Aprobaciones", value: 40, color: "#D59B2C" },
  { name: "Ediciones", value: 30, color: "#6B7280" },
  { name: "Rechazos", value: 30, color: "#EF4444" },
]

export function ReporteAcciones() {
  const [actionType, setActionType] = useState("all")
  const [showExportNotification, setShowExportNotification] = useState(false)

  const handleExport = () => {
    setShowExportNotification(true)
    setTimeout(() => setShowExportNotification(false), 3000)
  }

  const filteredData =
    actionType === "all"
      ? auditData
      : auditData.filter((item) => item.tipo === actionType)

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
            <Input type="date" className="w-[180px]" />
          </div>

          {/* Selector de tipo */}
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Tipo de acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las acciones</SelectItem>
              <SelectItem value="Inicio de sesión">Inicio de sesión</SelectItem>
              <SelectItem value="Creación">Creación</SelectItem>
              <SelectItem value="Edición">Edición</SelectItem>
              <SelectItem value="Eliminación">Eliminación</SelectItem>
              <SelectItem value="Aprobación">Aprobación</SelectItem>
              <SelectItem value="Rechazo">Rechazo</SelectItem>
            </SelectContent>
          </Select>

          {/* Exportar */}
          <Button
            variant="outline"
            onClick={handleExport}
            className="gap-2 ml-auto"
          >
            <Download className="h-4 w-4" />
            Exportar log
          </Button>
        </div>
      </div>

      {/* Notificación exportación */}
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
                Resultado
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border hover:bg-muted/50"
              >
                <td className="py-3 px-4 text-sm text-foreground">
                  {item.fecha}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-foreground">
                  {item.usuario}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                    {item.rol}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {item.accion}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.resultado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              label={({ name, percent = 0}) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
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
