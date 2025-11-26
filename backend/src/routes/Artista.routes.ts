import { Router } from "express";
import { artistaController } from "../controllers/ArtistaController";

const router = Router();

router.get("/", artistaController.listar);

router.post("/", artistaController.crear);

export default router;