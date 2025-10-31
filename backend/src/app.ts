import express, { Request, Response } from "express";
import uniteRouter from "./routes/routes";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use("/api", uniteRouter)

export default app;