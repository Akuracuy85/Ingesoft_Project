import express, { Request, Response } from "express";

const app = express();
const apiRouter = express.Router();

apiRouter.get("/sas", (req: Request, res: Response) => {
    
    res.json({
        "success" : true,
        "message" : "Las pantallas ya quedaron finas" 
    })
});

app.use("/api", apiRouter)

export default app;