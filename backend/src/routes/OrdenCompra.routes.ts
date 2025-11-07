// CAMBIO: [2025-10-26] - Creado OrdenCompra.routes.ts
// Define los endpoints para la gestión de órdenes.
// (No se requieren cambios)
import { Router } from "express";
import { ordenCompraController } from "@/controllers/OrdenCompraController";
import { sessionMiddleware } from "@/middlewares/SessionMiddleware";

const router = Router();

router.get(
  "/calcular", 
  sessionMiddleware.VerificarToken, // Protegida, asume que el usuario está logueado
  ordenCompraController.calcularTotal
);
// POST /api/orden
router.post("/", sessionMiddleware.VerificarToken, ordenCompraController.crearOrden);

// GET /api/orden/123
router.get("/:id", sessionMiddleware.VerificarToken, ordenCompraController.obtenerOrdenPorId);

// 🎯 6. AÑADIR NUEVA RUTA (LISTAR)
// GET /api/orden/mis-entradas/evento/123
router.get(
  "/mis-entradas/evento/:eventoId",
  sessionMiddleware.VerificarToken, // Requiere login
  ordenCompraController.listarMisDetallesPorEvento
);

// 🎯 7. AÑADIR NUEVA RUTA (CONTAR)
// GET /api/orden/mis-entradas/evento/123/count 
router.get(
  "/mis-entradas/evento/:eventoId/count",
  sessionMiddleware.VerificarToken, // Requiere login
  ordenCompraController.contarMisEntradasPorEvento
);
// POST /api/orden/calcular
router.patch(
  "/:id/confirmar",
  sessionMiddleware.VerificarToken, // Requiere login
  ordenCompraController.confirmarPago
);

export default router;