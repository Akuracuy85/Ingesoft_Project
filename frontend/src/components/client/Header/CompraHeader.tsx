// src/components/Header.tsx (FINAL CON RESETEO DE LOGO)
import { useDarkMode } from "@/hooks/useModoOscuro";
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { ArrowLeftIcon, CircleQuestionMarkIcon, Moon, Sun } from "lucide-react";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
interface CompraHeaderProps {
  minutos: number;
  segundos: number;
}

export const CompraHeader: React.FC<CompraHeaderProps> = ({ minutos, segundos }) => {

  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {evento} = location.state;
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[102px] px-6 bg-white/90 backdrop-blur-md shadow-md flex items-center justify-between z-50">
        <button onClick={() => setShowValidationModal(true)} className="cursor-pointer">
          <div className="flex flex-row">
            <ArrowLeftIcon className="h-6 w-6 text-gray-700 hover:text-gray-900 mx-3" />
            <p>Volver a la pagina del evento</p>
          </div>
        </button>
        <div className="flex w-100 justify-around">
          <button
            onClick={toggleDarkMode}
            className="
              p-2 rounded-full w-12 h-12
              bg-gray-200 dark:bg-gray-700
              hover:scale-110 transition 
              flex items-center justify-center
              cursor-pointer
            "
            title="Cambiar tema"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
          </button>
          <div
            className={`
              text-2xl font-semibold px-6 py-2 rounded-full transition-colors duration-300
              ${minutos >= 3
                ? "bg-green-100 text-green-700"
                : minutos >= 1
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
              }
              `}
              >
            Tiempo restante: {String(minutos).padStart(2, "0")}:
            {String(segundos).padStart(2, "0")}
          </div>
        </div>
      </header>
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salir de compra</DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <CircleQuestionMarkIcon className="w-10 h-10 text-yellow-600 mx-auto" />
              <p className="text-lg font-semibold text-foreground mt-4">
                ¿Seguro que deseas salir de la compra? Perderás tu puesto en la cola.
              </p>
            </div>
            <Button
              onClick={() => {
                setShowValidationModal(false)
                navigate("/eventos/" + evento.id + "/detalle")
              }}
              className="w-full bg-[#D59B2C] hover:bg-[#C08A25] text-white cursor-pointer"
            >
              Entendido
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
};