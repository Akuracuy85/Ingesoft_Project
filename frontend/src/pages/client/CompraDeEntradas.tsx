import { useEffect, useState } from "react";
import { BodyCompraEntradas } from "../../components/client/Body/CompraEntradas/BodyCompraEntradas";
import ColaService from "@/services/ColaService";
import { useLocation, useNavigate } from "react-router-dom";
import { Footer } from "@/components/client/Footer/Footer";
import { CompraHeader } from "@/components/client/Header/CompraHeader";
import { Header } from "@/components/client/Header/Header";

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
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <div>
        <Header />
      </div>
      <div className="h-[102px]" aria-hidden />
      <CompraHeader minutos={minutos} segundos={parseInt(segundos)} />
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
