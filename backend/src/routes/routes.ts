import express, { Request, Response } from "express";
import usuarioRoutes from "./Usuario.routes";
import authRouter from "./Auth.routes";
import eventoRoutes from "./Evento.routes";
import ordenCompraRoutes from "./OrdenCompra.routes"; 
import perfilRoutes from "./Perfil.routes";
import colaRoutes from "./Cola.routes";
import categoriaRoutes from "./Categoria.routes";
import artistaRoutes from "./Artista.routes";

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
uniteRouter.use("/cola", colaRoutes)
uniteRouter.use("/categoria", categoriaRoutes)
uniteRouter.use("/artista", artistaRoutes)


export default uniteRouter;
