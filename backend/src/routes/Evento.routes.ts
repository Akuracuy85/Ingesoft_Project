import { Router } from "express";
import { eventoController } from "@/controllers/EventoController";
import { sessionMiddleware } from "@/middlewares/sessionMiddleware";

const router = Router();

// Público: listado de eventos publicados.
router.get("/publicados", eventoController.listarPublicados);

// Privado (organizador): gestión de sus propios eventos.
router.get(
  "/basicos",
  sessionMiddleware.VerificarToken,
  eventoController.obtenerDatosBasicos
);
router.get(
  "/",
  sessionMiddleware.VerificarToken,
  eventoController.obtenerEventosDetallados
);
router.get("/:id", eventoController.obtenerPorId);
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
