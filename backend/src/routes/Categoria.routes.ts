// src/routes/Categoria.routes.ts
import { Router } from "express";
import { categoriaController } from "../controllers/CategoriaController";

const router = Router();

// Define la ruta: GET /api/categoria/
router.get("/", categoriaController.listar);

export default router;