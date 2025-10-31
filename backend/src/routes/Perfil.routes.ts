import { Router } from "express";
import { perfilController } from "@/controllers/PerfilController";
import { sessionMiddleware } from "@/middlewares/SessionMiddleware";

const router = Router();

// PUT /api/perfil
router.put("/", sessionMiddleware.VerificarToken, perfilController.actualizarPerfil);
router.get('/', sessionMiddleware.VerificarToken, perfilController.obtenerPerfil);
router.delete("/tarjeta/:tarjetaId", perfilController.eliminarTarjeta);
router.get("/puntos", perfilController.obtenerPuntos);

export default router;