import { Router } from "express";
import { perfilController } from "../controllers/PerfilController";
import { sessionMiddleware } from "../middlewares/SessionMiddleware";

const router = Router();

// PUT /api/perfil
router.get('/', sessionMiddleware.VerificarToken, perfilController.obtenerPerfil);

router.get("/puntos", sessionMiddleware.VerificarToken, perfilController.obtenerPuntos);

router.put("/", sessionMiddleware.VerificarToken, perfilController.actualizarPerfil);

router.post("/tarjeta", sessionMiddleware.VerificarToken, perfilController.agregarTarjeta);

router.delete("/tarjeta/:tarjetaId", sessionMiddleware.VerificarToken, perfilController.eliminarTarjeta);


export default router;