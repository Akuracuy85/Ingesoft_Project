"use client"

import ClientLayout from "../ClientLayout"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Clock, CheckCircle2 } from "lucide-react"
import ColaService from "@/services/ColaService"

export default function ColaVirtual() {
  const [turno, setTurno] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()
  const { evento, tipoTarifa } = location.state || {}

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const turno = await ColaService.obtenerPosicion(evento.cola.id)
        setTurno(turno)
        setProgress(Math.max(5, 100 - (turno / 500) * 100))
      } catch (error) {
        console.error("Error al obtener turno:", error)
      }
    }

    const ingresarACola = async () => {
      try {
        await ColaService.ingresarUsuarioACola(evento.cola.id)
      } catch (error) {
        console.error("Error al ingresar a la cola:", error)
      }
    }

    const encapsular = async () => {
      setLoading(true)
      await ingresarACola()
      await fetchTurno()
      setLoading(false)
    }

    encapsular()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!turno) return

    const interval = setInterval(async () => {
      try {
        const turnoActual = await ColaService.obtenerPosicion(evento.cola.id)
        setTurno(turnoActual)
        setProgress(Math.max(5, 100 - (turnoActual / 500) * 100))

        if (turnoActual === 1) {
          setTimeout(() => {
            navigate(`/eventos/${evento.id}/compra`, {
              state: { evento, tipoTarifa },
            })
          }, 2000)
        }

        await ColaService.enviarHeartbeat(evento.cola.id)
      } catch (error) {
        console.error("Error en polling posición:", error)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [turno, evento, navigate, tipoTarifa])

  const canPurchase = turno === 1

  // 🔹 PANTALLA DE CARGA CON FONDO UNIFORME
  if (loading || !turno) {
    return (
      <ClientLayout>
        <div className="min-h-screen flex justify-center items-center bg-white dark:bg-[#020817] transition-colors duration-300">
          <p className="text-muted-foreground animate-pulse">
            Cargando tu posición en la cola...
          </p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      {/* 🔹 CONTENEDOR PRINCIPAL CON FONDO SÓLIDO */}
      <div className="min-h-screen bg-white dark:bg-[#020817] transition-colors duration-300">
        <main className="container mx-auto px-4 py-8 max-w-4xl">

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Tu posición en la cola virtual
            </h1>
            <p className="text-muted-foreground">
              Mantén la ventana abierta hasta que llegue tu turno.
            </p>
          </div>

          {/* Tarjeta de posición */}
          <Card className="mb-8 p-6 sm:p-8 shadow-lg border dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full 
                              bg-[#D59B2C]/10 dark:bg-[#D59B2C]/20 mb-4">
                <span className="text-4xl font-bold text-[#D59B2C]">
                  #{turno}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-2">
                Tu posición actual
              </h2>

              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Tiempo estimado: {Math.ceil(turno / 120)} min</span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-6">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r 
                             from-[#D59B2C] to-[#F5C563] 
                             dark:from-yellow-600 dark:to-yellow-400
                             transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Botón */}
          <Button
            disabled={!canPurchase}
            className={`w-full h-14 text-lg font-semibold 
              ${canPurchase
                ? "bg-[#D59B2C] hover:bg-[#C08A25] text-white animate-pulse"
                : "bg-muted dark:bg-gray-700 text-muted-foreground cursor-not-allowed"
              }`}
            onClick={() => setShowValidationModal(true)}
          >
            {canPurchase ? "Ingresar a la compra" : "Esperando tu turno..."}
          </Button>
        </main>

        {/* Modal */}
        <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
          <DialogContent className="bg-white dark:bg-[#020817] text-foreground border dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>Validación de puesto</DialogTitle>
            </DialogHeader>

            <div className="py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto" />
              <p className="text-lg font-semibold mt-4">
                Tu posición actual es #{turno}
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

      </div>
    </ClientLayout>
  )
}
