import express, { Request, Response } from "express";

const app = express();

app.get("/api", (req: Request, res: Response) => {
    
    res.json({
        "success" : true,
        "message" : "Las pantallas ya quedaron finas" 
    })
});

export default app;