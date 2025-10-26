import { Router } from "express";
import { eventoController } from "@/controllers/EventoController";

const router = Router();

// Endpoint para el listado público de eventos
// GET /api/evento/publicados
router.get("/publicados", eventoController.listarPublicados);

// Endpoint para el detalle de un evento
// GET /api/evento/123
router.get("/:id", eventoController.obtenerPorId);

export default router;