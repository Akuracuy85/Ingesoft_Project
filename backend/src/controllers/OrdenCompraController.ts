// CAMBIO: [2025-10-26] - Creado OrdenCompraController
// CAMBIO: [2025-10-26] - Añadida validación de DTO
// NOTA: Este archivo no necesita cambios, ya que la validación
// del DTO (ahora sin 'puntosUtilizados') funciona igual.
import { Request, Response } from "express";
import { OrdenCompraService } from "@/services/OrdenCompraService";
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";
import { CrearOrdenDto } from "@/dto/orden/crear-orden.dto";
import { plainToClass } from "class-transformer"; 
import { validate } from "class-validator";
import { CustomError } from "@/types/CustomError";

export class OrdenCompraController {
  private static instance: OrdenCompraController;
  private ordenCompraService: OrdenCompraService;

  private constructor() {
    this.ordenCompraService = OrdenCompraService.getInstance();
  }

  public static getInstance(): OrdenCompraController {
    if (!OrdenCompraController.instance) {
      OrdenCompraController.instance = new OrdenCompraController();
    }
    return OrdenCompraController.instance;
  }

  /**
   * Maneja la solicitud POST para crear una nueva orden
   */
  crearOrden = async (req: Request, res: Response) => {
    try {
      const clienteId = req.userId; 
      if (!clienteId) {
        throw new CustomError("No autorizado (no se encontró userId en la sesión).", StatusCodes.UNAUTHORIZED);
      }
      
      const dto = plainToClass(CrearOrdenDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const mensajesError = errors.map(err => Object.values(err.constraints || {})).flat();
        throw new CustomError(mensajesError.join(', '), StatusCodes.BAD_REQUEST);
      }

      const nuevaOrden = await this.ordenCompraService.crearOrden(dto, clienteId);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        orden: nuevaOrden,
        // TODO: Devolver la 'paymentUrl' de la pasarela de pago
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  /**
   * Maneja la solicitud GET para obtener el detalle de una orden
   */
  obtenerOrdenPorId = async (req: Request, res: Response) => {
    try {
      const clienteId = req.userId;
      if (!clienteId) {
        throw new CustomError("No autorizado.", StatusCodes.UNAUTHORIZED);
      }

      const idOrden = Number(req.params.id);
      const orden = await this.ordenCompraService.obtenerOrden(idOrden, clienteId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        orden: orden
      });
    } catch (error) {
        HandleResponseError(res, error);
    }
  }
}

export const ordenCompraController = OrdenCompraController.getInstance();