import express, { Request, Response } from "express";
import uniteRouter from "./routes/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", uniteRouter)

export default app;