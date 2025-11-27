import { Router } from "express";
import { accionController } from "../controllers/AccionController";
import { sessionMiddleware } from "../middlewares/SessionMiddleware"; 
import { autorMiddleware } from "../middlewares/AutorMiddleware";

const router = Router();

// Esta es la ruta que expone la funcionalidad de búsqueda y filtrado
//funcionalidad: GET localhost:3000/api/acciones?fechaInicio=...&fechaFin=...&tipo=...&autorId=...
router.get("/", sessionMiddleware.VerificarToken, autorMiddleware.VerificarEsAdmin, accionController.obtenerAcciones);

router.get("/reporte", sessionMiddleware.VerificarToken, autorMiddleware.VerificarEsAdmin, accionController.generarReporteAcciones);


export default router;