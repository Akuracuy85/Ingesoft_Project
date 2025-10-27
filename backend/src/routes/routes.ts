// CAMBIO: [2025-10-26] - Añadidas rutas de OrdenCompra
// (No se requieren cambios)
import express, { Request, Response } from "express";
import usuarioRoutes from "./Usuario.routes";
import authRouter from "./Auth.routes";
import eventoRoutes from "./Evento.routes";
import ordenCompraRoutes from "./OrdenCompra.routes"; 

const uniteRouter = express.Router();

uniteRouter.get("/sas", (req: Request, res: Response) => {
    res.json({
        "success" : true,
        "message" : "Las pantallas ya quedaron finas" 
    })
});

uniteRouter.use("/usuario", usuarioRoutes)
uniteRouter.use("/auth", authRouter)
uniteRouter.use("/evento", eventoRoutes) 
uniteRouter.use("/orden", ordenCompraRoutes) 

export default uniteRouter;