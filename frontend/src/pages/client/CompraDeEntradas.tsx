import { useEffect } from "react";
import ClientLayout from "./ClientLayout";
import { BodyCompraEntradas } from "../../components/client/Body/CompraEntradas/BodyCompraEntradas"; 
import ColaService from "@/services/ColaService";
import { useLocation, useNavigate } from "react-router-dom";

export const CompraDeEntradas = () => { 
  const location = useLocation();
  const navigate = useNavigate();

  const { evento } = location.state || {};

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

  return (
    <ClientLayout>
      <BodyCompraEntradas />
    </ClientLayout>
  );
};

export default CompraDeEntradas;
