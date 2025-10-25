import { Router } from "express";
import { usuarioController } from "@/controllers/UsuarioController";

const router = Router();

router.get("/:id", usuarioController.obtenerPorId);

router.get("/rol/:rol", usuarioController.obtenerPorRol);

router.post("/", usuarioController.crearUsuario);

router.put("/:id", usuarioController.editarUsuario);

router.delete("/:id", usuarioController.borrar);

router.patch("/activar/:id", usuarioController.activar);

router.patch("/desactivar/:id", usuarioController.desactivar);

export default router;
