// src/controllers/OrdenCompraController.ts

import { Request, Response } from "express";
import { OrdenCompraService } from "@/services/OrdenCompraService";
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";
import { CrearOrdenDto } from "@/dto/orden/crear-orden.dto";
import { plainToClass } from "class-transformer"; 
import { validate } from "class-validator";
import { CustomError } from "@/types/CustomError";
import { CalcularPrecioDto } from "@/dto/orden/calcular-precio.dto";

function validateRequest(req: Request): { clienteId: number; eventoId: number } {
  const clienteId = req.userId; // ID viene del middleware VerificarToken
  if (!clienteId) {
    throw new CustomError("No autorizado. ID de cliente no encontrado.", StatusCodes.UNAUTHORIZED);
  }

  // El ID del evento ahora viene de 'eventoId' en los params
  const eventoId = Number(req.params.eventoId); 
  if (!Number.isInteger(eventoId) || eventoId <= 0) {
    throw new CustomError("El ID del evento no es válido.", StatusCodes.BAD_REQUEST);
  }
  
  return { clienteId, eventoId };
}

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
   // 🎯 4. AÑADIR NUEVO MANEJADOR (LISTAR)
  listarMisDetallesPorEvento = async (req: Request, res: Response) => {
    try {
      // Usamos el helper de validación
      const { clienteId, eventoId } = validateRequest(req);
      const detalles = await this.ordenCompraService.listarDetallesPorClienteYEvento(clienteId, eventoId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: detalles // Devuelve la lista de detalles de orden
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  // 🎯 5. AÑADIR NUEVO MANEJADOR (CONTAR)
  contarMisEntradasPorEvento = async (req: Request, res: Response) => {
    try {
      // Usamos el helper de validación
      const { clienteId, eventoId } = validateRequest(req);
      const count = await this.ordenCompraService.contarEntradasPorClienteYEvento(clienteId, eventoId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          cantidad: count // Devuelve el número total
        }
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };
  calcularTotal = async (req: Request, res: Response) => {
    try {
      // 1. Validar el DTO de entrada
      const dto = plainToClass(CalcularPrecioDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const mensajesError = errors.map(err => Object.values(err.constraints || {})).flat();
        throw new CustomError(mensajesError.join(', '), StatusCodes.BAD_REQUEST);
      }

      // 2. Llamar al servicio
      const totalCentimos = await this.ordenCompraService.calcularTotal(dto);

      // 3. Devolver la respuesta
      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          totalCentimos: totalCentimos,
          // (Este es el valor que tu frontend usará como "puntos")
        }
      });

    } catch (error) {
      HandleResponseError(res, error);
    }
  };
}

export const ordenCompraController = OrdenCompraController.getInstance();