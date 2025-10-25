import { AuthService } from "@/services/AuthService";
import { CrearCookieDeSesion } from "@/utils/CookieUtils";
import { HandleResponseError } from "@/utils/Errors";
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

  public async Status(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({
      success : true,
    });
  }

  public async Login(req: Request, res: Response) {
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

}

export const authController = AuthController.getInstance();
