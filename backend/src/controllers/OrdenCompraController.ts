// src/controllers/OrdenCompraController.ts

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
      const dto = plainToClass(CrearOrdenDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const mensajesError = errors.map(err => Object.values(err.constraints || {})).flat();
        throw new CustomError(mensajesError.join(', '), StatusCodes.BAD_REQUEST);
      }

      // El servicio ahora devuelve la orden y la URL de pago (simulada).
      const { orden, paymentUrl } = await this.ordenCompraService.crearOrden(dto, clienteId);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        ordenId: orden.id, // Devolvemos solo el ID de la orden
        paymentUrl: paymentUrl, // Devolvemos la URL simulada
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  /**
   * Maneja la solicitud GET para obtener el detalle de una orden
   * NOTA: Esta ruta SÍ requiere autenticación (VerificarToken está en el router)
   */
  obtenerOrdenPorId = async (req: Request, res: Response) => {
    try {
      const clienteId = req.userId;
      if (!clienteId) {
        // Este error sólo se lanzaría si el middleware no funciona correctamente.
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