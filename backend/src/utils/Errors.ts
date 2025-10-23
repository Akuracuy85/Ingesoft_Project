import { CustomError } from "@/types/CustomError";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export function handleError(res: Response, error: unknown) {
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    console.error("Error inesperado:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error interno del servidor" });
  }
}