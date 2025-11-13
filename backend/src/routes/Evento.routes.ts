import { Router } from "express";
import { eventoController } from "../controllers/EventoController";
import { sessionMiddleware } from "../middlewares/SessionMiddleware";

const router = Router();

// Público: listado de eventos publicados.
router.get("/publicados", eventoController.listarPublicados);

router.get("/compra/:id", eventoController.obtenerDatosCompraPorId);

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

router.get("/filtros/ubicaciones", eventoController.obtenerFiltrosUbicacion);

router.get("/publicados", eventoController.listarPublicados);

export default router;