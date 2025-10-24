import { Router } from "express";
import { usuarioController } from "@/controllers/UsuarioController";

const router = Router();

router.get("/:id", (req, res) => usuarioController.obtenerPorId(req, res));

router.get("/rol/:rol", (req, res) => usuarioController.obtenerPorRol(req, res));

router.post("/", (req, res) => usuarioController.crearUsuario(req, res));

router.put("/:id", (req, res) => usuarioController.editarUsuario(req, res));

router.delete("/:id", (req, res) => usuarioController.borrar(req, res));

router.patch("/activar/:id", (req, res) => usuarioController.activar(req, res));

router.patch("/desactivar/:id", (req, res) => usuarioController.desactivar(req, res));

export default router;
