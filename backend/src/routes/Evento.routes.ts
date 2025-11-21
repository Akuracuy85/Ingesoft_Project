import { Router } from "express";
import { eventoController } from "../controllers/EventoController";
import { sessionMiddleware } from "../middlewares/SessionMiddleware";
import { autorMiddleware } from "../middlewares/AutorMiddleware";

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

router.get(
  "/listar-todos",
  sessionMiddleware.VerificarToken,
  autorMiddleware.VerificarEsAdmin,
  eventoController.obtenerTodos
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

router.put(
  "/:id/datos-basicos",
  sessionMiddleware.VerificarToken,
  eventoController.actualizarDatosBasicos
);

router.put(
  "/:id/portada",
  sessionMiddleware.VerificarToken,
  eventoController.actualizarPortada
);

router.put(
  "/:id/imagen-lugar",
  sessionMiddleware.VerificarToken,
  eventoController.actualizarImagenLugar
);

router.put(
  "/:id/zonas",
  sessionMiddleware.VerificarToken,
  eventoController.actualizarZonas
);

router.put(
  "/:id/documentos",
  sessionMiddleware.VerificarToken,
  eventoController.actualizarDocumentos
);

router.put(
  "/:id/terminos",
  sessionMiddleware.VerificarToken,
  eventoController.actualizarTerminos
);

router.patch(
  "/:id/estado",
  sessionMiddleware.VerificarToken,
  eventoController.actualizarEstadoOrganizador
);

// ADMIN: aprobar un evento (ruta protegida)
router.patch(
  "/estado/:id/aprobar",
  sessionMiddleware.VerificarToken,
  autorMiddleware.VerificarEsAdmin,
  eventoController.aprobarEvento
);

// ADMIN: rechazar/cancelar un evento (acepta { motivo?: string } en el body)
router.patch(
  "/estado/:id/rechazar",
  sessionMiddleware.VerificarToken,
  autorMiddleware.VerificarEsAdmin,
  eventoController.rechazarEvento
);

router.get("/filtros/ubicaciones", eventoController.obtenerFiltrosUbicacion);

router.get("/publicados", eventoController.listarPublicados);

export default router;
