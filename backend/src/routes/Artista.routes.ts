// src/routes/Artista.routes.ts
import { Router } from "express";
import { artistaController } from "@/controllers/ArtistaController";

const router = Router();

// Define la ruta: GET /api/artista/
router.get("/", artistaController.listar);

export default router;