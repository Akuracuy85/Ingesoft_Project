import { useEffect, useState } from "react";
import { BodyCompraEntradas } from "../../components/client/Body/CompraEntradas/BodyCompraEntradas";
import ColaService from "@/services/ColaService";
import { useLocation, useNavigate } from "react-router-dom";
import { Footer } from "@/components/client/Footer/Footer";

export const CompraDeEntradas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tiempoRestante, setTiempoRestante] = useState<number>(5 * 60);

  const { evento } = location.state || {};

  const salirDeCola = async () => {
    if (evento?.cola?.id) {
      await ColaService.eliminarTurno(evento.cola.id);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();

      navigator.sendBeacon(
        "/api/cola/eliminar/" + evento?.cola?.id
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const interval = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          salirDeCola();
          navigate(`/eventos/${evento.id}/detalle`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(interval);
    };
  }, []);



  useEffect(() => {
    if (!evento?.cola?.id) return;

    const colaId = evento.cola.id;
    const interval = setInterval(async () => {
      try {
        await ColaService.enviarHeartbeat(colaId);
        const turno = await ColaService.obtenerPosicion(colaId);
        if (turno !== 1) {
          navigate(`/eventos/${evento.id}`);
        }
      } catch (e) {
        console.error("Error en heartbeat durante compra:", e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [evento]);


  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = (tiempoRestante % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="fixed w-full flex justify-center py-4 bg-white shadow">
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
      </header>

      <main>
        <BodyCompraEntradas />
      </main>
      <footer className="w-full">
        <Footer />
      </footer>
    </div>

  );
};

export default CompraDeEntradas;
