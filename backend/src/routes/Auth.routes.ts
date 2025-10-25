import { authController } from "@/controllers/AuthController";
import { Router } from "express";


const router = Router();

router.get("/status", (req, res) => authController.Status(req, res));

router.post("/login", (req, res) => authController.Login(req, res));

export default router;