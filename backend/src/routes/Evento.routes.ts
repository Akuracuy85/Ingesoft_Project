import { Router } from "express";
import { eventoController } from "@/controllers/EventoController";
import { sessionMiddleware } from "@/middlewares/sessionMiddleware";

const router = Router();

router.get(
  "/",
  sessionMiddleware.VerificarToken,
  eventoController.obtenerEventosDetallados
);
router.get(
  "/basicos",
  sessionMiddleware.VerificarToken,
  eventoController.obtenerDatosBasicos
);
router.post(
  "/",
  sessionMiddleware.VerificarToken,
  eventoController.crearEvento
);
router.put(
  "/:id",
  sessionMiddleware.VerificarToken,
  eventoController.actualizarEvento
);

export default router;
