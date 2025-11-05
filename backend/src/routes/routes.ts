import express, { Request, Response } from "express";
import usuarioRoutes from "./Usuario.routes";
import authRouter from "./Auth.routes";
import eventoRoutes from "./Evento.routes";
import ordenCompraRoutes from "./OrdenCompra.routes"; 
import perfilRoutes from "./Perfil.routes";
import turnoRoutes from "./VerificarTurno.routes";
import categoriaRoutes from "./Categoria.routes";
import artistaRoutes from "./Artista.routes";
import accionRoutes from "./Accion.routes";

const uniteRouter = express.Router();

uniteRouter.get("/sas", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Las pantallas ya quedaron finas",
  });
});

uniteRouter.use("/usuario", usuarioRoutes)
uniteRouter.use("/auth", authRouter)
uniteRouter.use("/evento", eventoRoutes) 
uniteRouter.use("/orden", ordenCompraRoutes) 
uniteRouter.use("/perfil", perfilRoutes)
uniteRouter.use("/turno", turnoRoutes)
uniteRouter.use("/acciones", accionRoutes)

uniteRouter.use("/categoria", categoriaRoutes) // Para GET /api/categoria
uniteRouter.use("/artista", artistaRoutes)     // Para GET /api/artista
export default uniteRouter;
