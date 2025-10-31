import { Request, Response } from "express";
import { PerfilService } from "@/services/PerfilService";
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";
import { sessionMiddleware } from "@/middlewares/SessionMiddleware";
import { Usuario } from "@/models/Usuario";

export class PerfilController {
  private static instance: PerfilController;
  private perfilService: PerfilService;

  private constructor() {
    this.perfilService = PerfilService.getInstance();
  }

  public static getInstance(): PerfilController {
    if (!PerfilController.instance) {
      PerfilController.instance = new PerfilController();
    }
    return PerfilController.instance;
  }

  /**
   * Controlador para actualizar el perfil del usuario autenticado.
   * Este método está protegido por el middleware de sesión.
   */
  actualizarPerfil = [
    sessionMiddleware.VerificarToken, // Middleware para validar el token y extraer el userId
    async (req: Request, res: Response) => {
      try {
        const userId = req.userId; // Extraído del middleware
        if (!userId) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "No autorizado",
          });
        }

        const nuevosDatos = req.body;

        await this.perfilService.actualizarPerfilUsuario(userId, nuevosDatos);

        res.status(StatusCodes.OK).json({
          success: true,
          message: "Perfil actualizado correctamente",
        });
      } catch (error) {
        HandleResponseError(res, error);
      }
    },
  ];
  /**
     * Controlador para obtener los datos del perfil del usuario autenticado.
     * Protegido por el middleware de sesión.
     */
    obtenerPerfil = [
        sessionMiddleware.VerificarToken, // Middleware para validar el token y extraer el userId
        async (req: Request, res: Response) => {
            try {
                const userId = req.userId; // Extraído del middleware

                if (!userId) {
                    // Aunque VerificarToken debería manejar esto, es buena práctica validarlo.
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: "No autorizado",
                    });
                }

                // Llamamos al servicio para obtener el usuario con sus tarjetas
                const usuario: Usuario = await this.perfilService.obtenerPerfilUsuario(userId);

                //Opcional: Si no quieres devolver el campo 'password' (que está excluido con select: false)
                // puedes asegurar que el objeto sea seguro antes de enviarlo.

                res.status(StatusCodes.OK).json({
                    success: true,
                    data: usuario,
                    message: "Perfil obtenido correctamente",
                });
            } catch (error) {
                HandleResponseError(res, error);
            }
        },
    ];

    eliminarTarjeta = [
        sessionMiddleware.VerificarToken, // Asegura que el usuario esté logueado
        async (req: Request, res: Response) => {
            try {
                const userId = req.userId; // ID del dueño, extraído del token
                const tarjetaId = parseInt(req.params.tarjetaId); // 🚨 ID de la tarjeta, extraído de la URL

                if (!userId) {
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: "No autorizado",
                    });
                }
                
                // Validación básica del parámetro
                if (isNaN(tarjetaId) || tarjetaId <= 0) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        success: false,
                        message: "ID de tarjeta inválido.",
                    });
                }

                // La lógica de negocio (verificación de propiedad y eliminación) está en el Service
                await this.perfilService.eliminarTarjetaUsuario(userId, tarjetaId);

                // 204 No Content es la respuesta HTTP estándar para una eliminación exitosa
                res.status(StatusCodes.OK).json({ 
                success: true,
                message: "Tarjeta eliminada correctamente."
                }); 
                
            } catch (error) {
                HandleResponseError(res, error);
            }
        },
    ];

    obtenerPuntos = [
        sessionMiddleware.VerificarToken, // Middleware para validar el token y extraer el userId
        async (req: Request, res: Response) => {
            try {
                const userId = req.userId; // Extraído del middleware

                if (!userId) {
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: "No autorizado",
                    });
                }

                // 1. Llamamos al servicio optimizado que solo trae el número de puntos
                const puntos = await this.perfilService.obtenerPuntosCliente(userId);

                // 2. Devolvemos la respuesta
                res.status(StatusCodes.OK).json({
                    success: true,
                    data: { puntos: puntos }, // Formato explícito para el frontend
                    message: "Puntos obtenidos correctamente",
                });
            } catch (error) {
                HandleResponseError(res, error);
            }
        },
    ];

}

export const perfilController = PerfilController.getInstance();