"use client"

import ClientLayout from "../ClientLayout"
import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Clock, Users, Star, RefreshCw, CheckCircle2 } from "lucide-react"

export default function ColaVirtual() {
  const [position, setPosition] = useState(356)
  const [points, setPoints] = useState(1250)
  const [estimatedTime, setEstimatedTime] = useState(3)
  const [totalInQueue, setTotalInQueue] = useState(1240)
  const [progress, setProgress] = useState(71)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)

  // Simula el avance de la cola
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev > 1) {
          const newPosition = prev - 1
          setProgress(Math.max(5, 100 - (newPosition / 500) * 100))
          setEstimatedTime(Math.ceil(newPosition / 120))
          return newPosition
        }
        return prev
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const redeemPoints = (pointsCost: number, positionsToMove: number) => {
    if (points >= pointsCost) {
      setIsRedeeming(true)
      setTimeout(() => {
        setPoints(points - pointsCost)
        setPosition(Math.max(1, position - positionsToMove))
        setProgress(Math.max(5, 100 - ((position - positionsToMove) / 500) * 100))
        setEstimatedTime(Math.ceil((position - positionsToMove) / 120))
        setShowSuccessMessage(true)
        setIsRedeeming(false)
        setTimeout(() => setShowSuccessMessage(false), 3000)
      }, 1000)
    }
  }

  const canPurchase = position === 1

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D59B2C] flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <span className="text-xl font-bold text-foreground">Unite</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">Cola de compra</span>
              <div className="w-10 h-10 rounded-full bg-[#D59B2C] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
              Tu posición en la cola virtual
            </h1>
            <p className="text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Gracias por tu compra. Estás en la cola para acceder al evento. Puedes usar tus puntos acumulados para
              mejorar tu posición.
            </p>
          </div>

          {/* Mensaje de éxito */}
          {showSuccessMessage && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <Card className="border-success/50 bg-success/10 p-4">
                <div className="flex items-center gap-3 text-success">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p className="font-medium">¡Tu posición ha mejorado!</p>
                </div>
              </Card>
            </div>
          )}

          {/* Tarjeta de posición */}
          <Card className="mb-8 p-6 sm:p-8 shadow-lg border-2">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#D59B2C]/10 mb-4">
                <span className="text-4xl font-bold text-[#D59B2C]">#{position}</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Tu posición actual</h2>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Tiempo estimado: {estimatedTime} {estimatedTime === 1 ? "minuto" : "minutos"}
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

          {/* Canje de puntos */}
          <Card className="mb-8 p-6 sm:p-8 shadow-lg">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">¿Deseas mejorar tu posición?</h3>
              <div className="flex items-center gap-2 text-[#D59B2C]">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">Tienes {points.toLocaleString()} puntos</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <Card className="p-4 border-2 hover:border-[#D59B2C]/50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">10</div>
                  <div className="text-sm text-muted-foreground mb-3">puestos</div>
                  <div className="text-sm font-semibold text-[#D59B2C] mb-3">200 puntos</div>
                  <Button
                    onClick={() => redeemPoints(200, 10)}
                    disabled={points < 200 || isRedeeming}
                    className="w-full bg-[#D59B2C] hover:bg-[#C08A25] text-white"
                    size="sm"
                  >
                    Canjear
                  </Button>
                </div>
              </Card>

              <Card className="p-4 border-2 border-[#D59B2C]/30 hover:border-[#D59B2C] transition-colors relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#D59B2C] text-white text-xs px-2 py-0.5 rounded-full">
                  Popular
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">30</div>
                  <div className="text-sm text-muted-foreground mb-3">puestos</div>
                  <div className="text-sm font-semibold text-[#D59B2C] mb-3">500 puntos</div>
                  <Button
                    onClick={() => redeemPoints(500, 30)}
                    disabled={points < 500 || isRedeeming}
                    className="w-full bg-[#D59B2C] hover:bg-[#C08A25] text-white"
                    size="sm"
                  >
                    Canjear
                  </Button>
                </div>
              </Card>

              <Card className="p-4 border-2 hover:border-[#D59B2C]/50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">80</div>
                  <div className="text-sm text-muted-foreground mb-3">puestos</div>
                  <div className="text-sm font-semibold text-[#D59B2C] mb-3">1,000 puntos</div>
                  <Button
                    onClick={() => redeemPoints(1000, 80)}
                    disabled={points < 1000 || isRedeeming}
                    className="w-full bg-[#D59B2C] hover:bg-[#C08A25] text-white"
                    size="sm"
                  >
                    Canjear
                  </Button>
                </div>
              </Card>
            </div>

            <Button onClick={() => setShowValidationModal(true)} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Validar mi puesto actual
            </Button>
          </Card>

          {/* Info extra */}
          <Card className="p-6 bg-muted/50 border-dashed mb-6">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Esta cola garantiza el acceso justo a las entradas. Mantén esta ventana abierta hasta que llegue tu turno.
            </p>
          </Card>

          {/* Botón de compra */}
          <Button
            disabled={!canPurchase}
            className={`w-full h-14 text-lg font-semibold ${
              canPurchase
                ? "bg-[#D59B2C] hover:bg-[#C08A25] text-white animate-pulse"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
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
              <p className="text-lg font-semibold text-foreground mb-2">Tu posición actual es #{position}</p>
              <p className="text-sm text-muted-foreground">Se aplicaron correctamente tus beneficios.</p>
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
