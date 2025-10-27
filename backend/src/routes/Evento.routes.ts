import { Router } from "express";
import { eventoController } from "@/controllers/EventoController";

const router = Router();

router.get("/basicos", eventoController.obtenerDatosBasicos);
router.post("/", eventoController.crearEvento);

export default router;
