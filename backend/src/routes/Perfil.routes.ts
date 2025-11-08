import { Router } from "express";
import { perfilController } from "../controllers/PerfilController";
import { sessionMiddleware } from "../middlewares/SessionMiddleware";

const router = Router();

// PUT /api/perfil
router.put("/", sessionMiddleware.VerificarToken, perfilController.actualizarPerfil);
router.get('/', sessionMiddleware.VerificarToken, perfilController.obtenerPerfil);
router.delete("/tarjeta/:tarjetaId", sessionMiddleware.VerificarToken, perfilController.eliminarTarjeta);
router.get("/puntos", sessionMiddleware.VerificarToken, perfilController.obtenerPuntos);

export default router;