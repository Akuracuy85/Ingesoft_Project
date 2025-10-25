import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { VerificarAccessToken } from "@/utils/JWTUtils";

export class SessionMiddleware {
  
  public VerificarToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "No autorizado"
      });
    }

    try {
      const decoded = VerificarAccessToken(token) as { userId: number };
      req.userId = decoded.userId;
      next();
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Token inválido o expirado"
      });
    }
  }
}