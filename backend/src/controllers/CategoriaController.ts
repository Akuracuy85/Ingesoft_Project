// src/controllers/CategoriaController.ts
import { Request, Response } from "express";
import { CategoriaService } from "../services/CategoriaService";
import { HandleResponseError } from "../utils/Errors";
import { StatusCodes } from "http-status-codes";

export class CategoriaController {
  private static instance: CategoriaController;
  private categoriaService: CategoriaService;

  private constructor() {
    this.categoriaService = CategoriaService.getInstance();
  }

  public static getInstance(): CategoriaController {
    if (!CategoriaController.instance) {
      CategoriaController.instance = new CategoriaController();
    }
    return CategoriaController.instance;
  }

  listar = async (req: Request, res: Response) => {
    try {
      const categorias = await this.categoriaService.listarCategorias();
      res.status(StatusCodes.OK).json({
        success: true,
        data: categorias,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  // Nuevo: crear categoría
  crear = async (req: Request, res: Response) => {
    try {
      const { nombre } = req.body;
      const creada = await this.categoriaService.crearCategoria({ nombre });
      res.status(StatusCodes.CREATED).json({ success: true, data: creada });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };
}

export const categoriaController = CategoriaController.getInstance();