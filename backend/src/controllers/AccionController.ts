import { Request, Response } from "express";
import { AccionService } from "@/services/AccionService"; // Asegúrate de que la ruta sea correcta
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";
import { TipoAccion } from "@/enums/TipoAccion"; 

export class AccionController {
    private static instance: AccionController;
    private accionService: AccionService;

    private constructor() {
        this.accionService = AccionService.getInstance();
    }

    public static getInstance(): AccionController {
        if (!AccionController.instance) {
            AccionController.instance = new AccionController();
        }
        return AccionController.instance;
    }

    obtenerAcciones = async (req: Request, res: Response) => {
        try {
            const { fechaInicio, fechaFin, tipo, autorId } = req.query;

            const filtros = {
                fechaInicio: fechaInicio as string,
                fechaFin: fechaFin as string,
                tipo: tipo as TipoAccion,
                autorId: autorId ? Number(autorId) : undefined,
            };

            const acciones = await this.accionService.buscarAccionesAdministradores(filtros);
            
            res.status(StatusCodes.OK).json({
                success: true,
                acciones: acciones,
                count: acciones.length,
                message: "Historial de acciones obtenido con éxito."
            });
        } catch (error) {
            HandleResponseError(res, error);
        }
    };
}

export const accionController = AccionController.getInstance();