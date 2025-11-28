"use client"
import ClientLayout from "../ClientLayout"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Card } from "../../../components/ui/card"
import { Clock } from "lucide-react"
import ColaService from "@/services/ColaService"
import Loading from '@/components/common/Loading'
import { useCompraGuard } from "@/context/CompraGuardContext"; // 🔹 importa el hook

export default function ColaVirtual() {
  const { setIsCompraActive } = useCompraGuard(); // 🔹 acceso al contexto
  const [turno, setTurno] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()
  const { evento, tipoTarifa } = location.state || {}

  useEffect(() => {
    setIsCompraActive(true, evento.cola.id);
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

  // 🔹 PANTALLA DE CARGA CON FONDO UNIFORME
  if (loading || !turno) {
    return (
      <ClientLayout>
        <Loading fullScreen message={"Cargando tu posición en la cola..."} />
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
        </main>
      </div>
    </ClientLayout>
  )
}
