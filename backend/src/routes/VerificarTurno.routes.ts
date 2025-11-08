import { Router } from "express";
import { verificarTurnoController } from "../controllers/VerificarTurnoController"; 
import { sessionMiddleware } from "../middlewares/SessionMiddleware";

const turnoRoutes = Router();
turnoRoutes.get("/verificar/:eventoId", sessionMiddleware.VerificarToken, verificarTurnoController.obtenerPosicionYpuntos);

export default turnoRoutes;