// src/routes/Artista.routes.ts
import { Router } from "express";
import { artistaController } from "../controllers/ArtistaController";

const router = Router();

// Define la ruta: GET /api/artista/
router.get("/", artistaController.listar);
// Nuevo: POST crear artista
router.post("/", artistaController.crear);

export default router;