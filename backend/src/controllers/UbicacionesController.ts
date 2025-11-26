import { Request, Response } from "express";
import { HandleResponseError } from "../utils/Errors";
import { StatusCodes } from "http-status-codes";
import { UbicacionesService } from "@/services/UbicacionesService";

export class UbicacionesController {
  private static instance: UbicacionesController;
  private ubicacionesService: UbicacionesService;

  private constructor() {
    this.ubicacionesService = UbicacionesService.getInstance();
  }

  public static getInstance(): UbicacionesController {
    if (!UbicacionesController.instance) {
      UbicacionesController.instance = new UbicacionesController();
    }
    return UbicacionesController.instance;
  }

  listar = async (req: Request, res: Response) => {
    try {
      const departamentos = await this.ubicacionesService.listarDepartamentos();
      res.status(StatusCodes.OK).json({
        success: true,
        data: departamentos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

}

export const ubicacionesController = UbicacionesController.getInstance();