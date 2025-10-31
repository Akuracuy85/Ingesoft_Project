// CAMBIO: [2025-10-26] - Creado OrdenCompra.routes.ts
// Define los endpoints para la gestión de órdenes.
// (No se requieren cambios)
import { Router } from "express";
import { ordenCompraController } from "@/controllers/OrdenCompraController";
import { sessionMiddleware } from "@/middlewares/SessionMiddleware";

const router = Router();

// POST /api/orden
router.post("/", ordenCompraController.crearOrden);

// GET /api/orden/123
router.get("/:id", sessionMiddleware.VerificarToken, ordenCompraController.obtenerOrdenPorId);

export default router;