import { Router } from "express";
import { categoriaController } from "../controllers/CategoriaController";

const router = Router();

router.get("/", categoriaController.listar);

router.post("/", categoriaController.crear);

export default router;