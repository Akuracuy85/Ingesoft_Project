import { Categoria } from "../models/Categoria";
import { CategoriaRepository } from "../repositories/CategoriaRepository";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";

export class CategoriaService {
  private static instance: CategoriaService;
  private categoriaRepository: CategoriaRepository;

  private constructor() {
    this.categoriaRepository = CategoriaRepository.getInstance();
  }

  public static getInstance(): CategoriaService {
    if (!CategoriaService.instance) {
      CategoriaService.instance = new CategoriaService();
    }
    return CategoriaService.instance;
  }

  async listarCategorias(): Promise<Categoria[]> {
    try {
      return await this.categoriaRepository.listarTodas();
    } catch (error) {
      throw new CustomError("Error al obtener las categorías", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Nuevo: crear categoría
  async crearCategoria(data: { nombre: string }): Promise<Categoria> {
    const nombre = (data?.nombre || "").trim();
    if (!nombre) {
      throw new CustomError("El nombre es obligatorio", StatusCodes.BAD_REQUEST);
    }
    try {
      return await this.categoriaRepository.crear({ nombre });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al crear la categoría", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const categoriaService = CategoriaService.getInstance();