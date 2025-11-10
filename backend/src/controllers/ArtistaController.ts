// src/controllers/ArtistaController.ts
import { Request, Response } from "express";
import { ArtistaService } from "../services/ArtistaService";
import { HandleResponseError } from "../utils/Errors";
import { StatusCodes } from "http-status-codes";

export class ArtistaController {
  private static instance: ArtistaController;
  private artistaService: ArtistaService;

  private constructor() {
    this.artistaService = ArtistaService.getInstance();
  }

  public static getInstance(): ArtistaController {
    if (!ArtistaController.instance) {
      ArtistaController.instance = new ArtistaController();
    }
    return ArtistaController.instance;
  }

  listar = async (req: Request, res: Response) => {
    try {
      const artistas = await this.artistaService.listarArtistasParaDropdown();
      res.status(StatusCodes.OK).json({
        success: true,
        data: artistas,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };
}

export const artistaController = ArtistaController.getInstance();