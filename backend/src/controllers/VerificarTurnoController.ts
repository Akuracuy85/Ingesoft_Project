import { Request, Response } from "express";
import { VerificarTurnoService } from "@/services/VerificarTurnoService";
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";
import { sessionMiddleware } from "@/middlewares/SessionMiddleware"; 
import { InfoTurnoCliente } from "@/repositories/VerificarTurnoRepository"; 

export class VerificarTurnoController {
    private static instance: VerificarTurnoController;
    private verificarTurnoService: VerificarTurnoService;

    private constructor() {
        this.verificarTurnoService = VerificarTurnoService.getInstance();
    }

    public static getInstance(): VerificarTurnoController {
        if (!VerificarTurnoController.instance) {
            VerificarTurnoController.instance = new VerificarTurnoController();
        }
        return VerificarTurnoController.instance;
    }

    /**
     * @description Controlador para obtener la posición actual del cliente en el turno 
     * de un evento específico y sus puntos de fidelidad.
     * La ruta debería ser: GET /api/turno/verificar/:eventoId
     */
    obtenerPosicionYpuntos = [
        async (req: Request, res: Response) => {
            try {
                const userId = req.userId; // ID del cliente, extraído del token
                // 2. Extraer el ID del Evento desde los parámetros de la URL
                const eventoId = parseInt(req.params.eventoId); 

                // 3. Validaciones de existencia y formato
                if (!userId) {
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: "No autorizado o token inválido.",
                    });
                }
                if (isNaN(eventoId) || eventoId <= 0) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        success: false,
                        message: "ID de evento inválido.",
                    });
                }

                // 4. Llamar al servicio
                const info: InfoTurnoCliente = await this.verificarTurnoService.obtenerInformacionTurno(
                    userId,
                    eventoId
                );

                // 5. Devolver la respuesta
                res.status(StatusCodes.OK).json({
                    success: true,
                    data: info,
                    message: "Información de turno y puntos obtenida correctamente.",
                });

            } catch (error) {
                HandleResponseError(res, error);
            }
        },
    ];
}

export const verificarTurnoController = VerificarTurnoController.getInstance();