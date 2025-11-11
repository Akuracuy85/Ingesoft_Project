"use client"

import ClientLayout from "../ClientLayout"
import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Clock, Users, CheckCircle2 } from "lucide-react"
import turnoColaService from "../../../services/TurnoColaService"
import type { TurnoCola } from "../../../models/TurnoCola"

export default function ColaVirtual() {
  const [turno, setTurno] = useState<TurnoCola | null>(null)
  const [totalInQueue, setTotalInQueue] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const data = await turnoColaService.getAll()
        const miTurno = data[0] || {
          id: 1,
          posicion: 356,
          ingreso: new Date().toISOString(),
          estado: "en_cola",
        }
        setTurno(miTurno)
        setTotalInQueue(data.length || 1240)
        setProgress(Math.max(5, 100 - (miTurno.posicion / 500) * 100))
      } catch (error) {
        console.error("Error al obtener turno:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTurno()
  }, [])
  useEffect(() => {
    if (!turno) return

    const interval = setInterval(() => {
      setTurno((prev) => {
        if (!prev) return prev
        const nuevaPos = prev.posicion > 1 ? prev.posicion - 1 : 1
        setProgress(Math.max(5, 100 - (nuevaPos / 500) * 100))
        return { ...prev, posicion: nuevaPos }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [turno])

  const canPurchase = turno?.posicion === 1

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-muted-foreground animate-pulse">Cargando tu posición en la cola...</p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Tu posición en la cola virtual
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Gracias por tu compra. Estás en la cola para acceder al evento. Mantén esta ventana abierta hasta que llegue tu turno.
            </p>
          </div>

          {/* Tarjeta de posición */}
          <Card className="mb-8 p-6 sm:p-8 shadow-lg border-2">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#D59B2C]/10 mb-4">
                <span className="text-4xl font-bold text-[#D59B2C]">
                  #{turno?.posicion ?? "-"}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Tu posición actual</h2>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Tiempo estimado: {Math.ceil((turno?.posicion ?? 0) / 120)}{" "}
                  {Math.ceil((turno?.posicion ?? 0) / 120) === 1 ? "minuto" : "minutos"}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-6">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D59B2C] to-[#F5C563] transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Estadísticas */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Participantes en cola: {totalInQueue.toLocaleString()}</span>
            </div>
          </Card>

          {/* Info extra */}
          <Card className="p-6 bg-muted/50 border-dashed mb-6">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Esta cola garantiza el acceso justo a las entradas. No cierres esta ventana mientras esperas tu turno.
            </p>
          </Card>

          {/* Botón de compra */}
          <Button
            disabled={!canPurchase}
            className={`w-full h-14 text-lg font-semibold ${canPurchase
                ? "bg-[#D59B2C] hover:bg-[#C08A25] text-white animate-pulse"
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            onClick={() => setShowValidationModal(true)}
          >
            {canPurchase ? "Ingresar a la compra" : "Esperando tu turno..."}
          </Button>
        </main>

        {/* Modal de validación */}
        <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Validación de puesto</DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">
                Tu posición actual es #{turno?.posicion}
              </p>
              <p className="text-sm text-muted-foreground">
                Se ha validado correctamente tu estado en la cola.
              </p>
            </div>
            <Button
              onClick={() => setShowValidationModal(false)}
              className="w-full bg-[#D59B2C] hover:bg-[#C08A25] text-white"
            >
              Entendido
            </Button>
          </DialogContent>
        </Dialog>

        {/* Fondo decorativo */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#D59B2C]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#D59B2C]/5 rounded-full blur-3xl" />
        </div>
      </div>
    </ClientLayout>
  )
}
