import express, { Request, Response } from "express";
import usuarioRoutes from "./Usuario.routes";
import authRouter from "./Auth.routes";
import eventoRoutes from "./Evento.routes";

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

export default uniteRouter