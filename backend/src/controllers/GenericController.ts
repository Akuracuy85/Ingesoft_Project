import { StatusCodes } from "http-status-codes";
import { GenericService } from "../services/GenericService";
import { HandleResponseError } from "@/utils/Errors";
import { Request, Response } from "express";

export class GenericController {
  private static instance: GenericController;
  private genericService: GenericService;

  private constructor() {
    this.genericService = GenericService.getInstance();
  }

  public static getInstance(): GenericController {
    if (!GenericController.instance) {
      GenericController.instance = new GenericController();
    }
    return GenericController.instance;
  }

  subirTerminosYCondiciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const { base64 } = req.body;
      const url = await this.genericService.SubirTerminosYCondiciones(base64);
      res.status(StatusCodes.OK).json({ success: true, url });
    } catch (error) {
      HandleResponseError(res, error)
    }
  }

}

export const genericController = GenericController.getInstance();