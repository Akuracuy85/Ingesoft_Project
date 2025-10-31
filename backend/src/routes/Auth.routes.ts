import { authController } from "@/controllers/AuthController";
import { sessionMiddleware } from "@/middlewares/sessionMiddleware";
import { Router } from "express";


const router = Router();

router.get("/status", sessionMiddleware.VerificarToken, authController.Status);

router.post("/login", authController.Login);

router.delete("/logout", sessionMiddleware.VerificarToken, authController.Logout);

export default router;