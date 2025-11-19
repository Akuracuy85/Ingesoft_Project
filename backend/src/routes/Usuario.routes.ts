import { Router } from "express";
import { usuarioController } from "../controllers/UsuarioController";
import { sessionMiddleware } from "../middlewares/SessionMiddleware";
import { autorMiddleware} from "../middlewares/AutorMiddleware";

const router = Router();

router.get("/", sessionMiddleware.VerificarToken, usuarioController.obtenerTodos);

router.get("/:id", usuarioController.obtenerPorId);

router.get("/rol/:rol", usuarioController.obtenerPorRol);

router.post("/", usuarioController.crearUsuario);

router.put("/:id", usuarioController.editarUsuario);

router.delete("/:id", usuarioController.borrar);

router.patch("/activar/:id", sessionMiddleware.VerificarToken, autorMiddleware.VerificarEsAdmin, usuarioController.activar);

router.patch("/desactivar/:id", sessionMiddleware.VerificarToken, autorMiddleware.VerificarEsAdmin, usuarioController.desactivar);


export default router;
