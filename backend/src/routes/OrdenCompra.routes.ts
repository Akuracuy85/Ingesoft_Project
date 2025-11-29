import { Router } from "express";
import { ordenCompraController } from "../controllers/OrdenCompraController";
import { sessionMiddleware } from "../middlewares/SessionMiddleware";
import { autorMiddleware } from "../middlewares/AutorMiddleware";

const router = Router();

router.get(
  "/calcular", 
  sessionMiddleware.VerificarToken, 
  ordenCompraController.calcularTotal
);

router.post("/", sessionMiddleware.VerificarToken, ordenCompraController.crearOrden);

router.get("/:id", sessionMiddleware.VerificarToken, ordenCompraController.obtenerOrdenPorId);

router.get(
  "/mis-entradas/evento/:eventoId",
  sessionMiddleware.VerificarToken, 
  ordenCompraController.listarMisDetallesPorEvento
);


router.get(
  "/mis-entradas/evento/:eventoId/count",
  sessionMiddleware.VerificarToken,
  ordenCompraController.contarMisEntradasPorEvento
);


router.patch(
  "/:id/confirmar-standar",
  sessionMiddleware.VerificarToken,
  ordenCompraController.confirmarStandar
);

router.patch(
  "/:id/confirmar-preventa",
  sessionMiddleware.VerificarToken,
  ordenCompraController.confirmarPreventa
);


router.get(
  "/admin/listar",
  sessionMiddleware.VerificarToken,
  autorMiddleware.VerificarEsAdmin,
  ordenCompraController.listarComprasAdmin
);

export default router;
