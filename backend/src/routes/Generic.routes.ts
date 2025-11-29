import { Router } from "express";
import { genericController } from "../controllers/GenericController"; 
import { sessionMiddleware } from "../middlewares/SessionMiddleware";
import { autorMiddleware } from "../middlewares/AutorMiddleware";

const genericRouter = Router();

genericRouter.put("/terminos-y-condiciones", 
  sessionMiddleware.VerificarToken, 
  autorMiddleware.VerificarEsAdmin, 
  genericController.subirTerminosYCondiciones
);


export default genericRouter;