import { ubicacionesController } from "../controllers/UbicacionesController";
import { Router } from "express";

const router = Router();

router.get("/", ubicacionesController.listar);

export default router;