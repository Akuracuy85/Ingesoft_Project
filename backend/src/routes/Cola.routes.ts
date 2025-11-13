import { Router } from "express";
import { colaController } from "../controllers/ColaController"; 
import { sessionMiddleware } from "../middlewares/SessionMiddleware";
import { autorMiddleware } from "@/middlewares/AutorMiddleware";

const colaRoutes = Router();

colaRoutes.post("/crear/:eventoId", sessionMiddleware.VerificarToken, autorMiddleware.VerificarEsOrganizador, colaController.crearCola);

colaRoutes.get("/verificar/:colaId", sessionMiddleware.VerificarToken, colaController.obtenerPosicion);

colaRoutes.post("/ingresar/:eventoId", sessionMiddleware.VerificarToken, colaController.ingresarUsuarioACola);

colaRoutes.post("/heartbeat/:colaId", sessionMiddleware.VerificarToken, colaController.actualizarHeartbeat);

colaRoutes.delete("/eliminar/:colaId", sessionMiddleware.VerificarToken, colaController.eliminarTurno);

export default colaRoutes;