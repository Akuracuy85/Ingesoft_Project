import { AuthService } from "../services/AuthService";
import { CrearCookieDeSesion } from "../utils/CookieUtils";
import { HandleResponseError } from "../utils/Errors";
import { GenerarAccessToken, VerificarRefreshToken } from "../utils/JWTUtils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";


export class AuthController {
  private static instance: AuthController;
  private authService: AuthService;

  private constructor() {
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  Status = async (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
      success: true,
      expiresIn: req.tokenExpiresIn || 0
    });
  }

  Login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const { accessToken, refreshToken } = await this.authService.AutenticarUsuario(email, password);
      CrearCookieDeSesion(res, accessToken, refreshToken);
      res.status(StatusCodes.OK).json({
        success: true,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  }

  Refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "No autorizado auth" });
    }

    try {
      const decoded = VerificarRefreshToken(refreshToken);
      const newAccessToken = GenerarAccessToken(decoded.userId);
      CrearCookieDeSesion(res, newAccessToken);

      return res.status(StatusCodes.OK).json({ success: true });
    } catch {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Refresh token inválido o expirado" });
    }
  }

  Logout = async (req: Request, res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(StatusCodes.OK).json({ success: true });
  }

}

export const authController = AuthController.getInstance();
