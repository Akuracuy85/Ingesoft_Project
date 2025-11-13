import { Router } from "express";
import { accionController } from "@/controllers/AccionController";
import { sessionMiddleware } from "@/middlewares/SessionMiddleware"; 

const router = Router();

// Esta es la ruta que expone la funcionalidad de búsqueda y filtrado
//funcionalidad: GET localhost:3000/api/acciones?fechaInicio=...&fechaFin=...&tipo=...&autorId=...
router.get("/", sessionMiddleware.VerificarToken, accionController.obtenerAcciones);

export default router;