import { Router } from "express";
import { eventoController } from "@/controllers/EventoController";
import { sessionMiddleware } from "@/middlewares/sessionMiddleware";

const router = Router();

// Público: listado de eventos publicados.
router.get("/publicados", eventoController.listarPublicados);

// === NUEVO ENDPOINT PÚBLICO: Obtener datos de compra por ID ===
// Endpoint: /api/evento/compra/:id
router.get("/compra/:id", eventoController.obtenerDatosCompraPorId); // ✅ CORRECCIÓN: USAR EL MÉTODO DTO

// Privado (organizador): gestión de sus propios eventos.
router.get(
  "/basicos",
  sessionMiddleware.VerificarToken,
  eventoController.obtenerDatosBasicos
);
// ... [otras rutas privadas]
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