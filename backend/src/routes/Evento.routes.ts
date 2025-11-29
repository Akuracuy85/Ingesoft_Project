import { Router } from "express";
import { eventoController } from "../controllers/EventoController";
import { sessionMiddleware } from "../middlewares/SessionMiddleware";
import { autorMiddleware } from "../middlewares/AutorMiddleware";

const router = Router();

router.get("/publicados", eventoController.listarPublicados);

router.get("/compra/:id", eventoController.obtenerDatosCompraPorId);

router.get(
  "/basicos",
  sessionMiddleware.VerificarToken,
  eventoController.obtenerDatosBasicos
);

router.get(
  "/admin/listar",
  sessionMiddleware.VerificarToken,
  autorMiddleware.VerificarEsAdmin,
  eventoController.listarEventosAdmin
);

router.get(
  "/admin/listar/reporte",
  sessionMiddleware.VerificarToken,
  autorMiddleware.VerificarEsAdmin,
  eventoController.generarReporteVentas,
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

router.get("/front-body/:id", eventoController.obtenerPorIdParaPantallaDetalle);

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

router.get(
  "/:id/documentos",
  sessionMiddleware.VerificarToken,
  eventoController.obtenerDocumentosRespaldo
);

export default router;
