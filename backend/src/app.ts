import { Request, Response } from "express";

const express = require("express");

const app = express();

app.get("/api", (req: Request, res: Response) => {
    
    res.json({
        "success" : true,
        "message" : "Haz las pantallas Ivan" 
    })
});

export default app;