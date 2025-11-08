import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { VerificarAccessToken } from "../utils/JWTUtils";

export class SessionMiddleware {
  
  VerificarToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "No autorizado"
      });
    }

    try {
      const decoded = VerificarAccessToken(token) as { userId: number, exp: number };
      req.userId = decoded.userId;
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      req.tokenExpiresIn = Math.max(0, expirationTime - currentTime);
      next();
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        message: "Token inválido o expirado"
      });
    }
  }
}

export const sessionMiddleware = new SessionMiddleware();