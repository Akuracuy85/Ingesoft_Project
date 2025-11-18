// src/services/ArtistaService.ts
import { ArtistaRepository } from "../repositories/ArtistaRepository";
import { CategoriaRepository } from "../repositories/CategoriaRepository";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";

type ArtistaDropdown = {
  id: number;
  nombre: string;
}

export class ArtistaService {
  private static instance: ArtistaService;
  private artistaRepository: ArtistaRepository;

  private constructor() {
    this.artistaRepository = ArtistaRepository.getInstance();
  }

  public static getInstance(): ArtistaService {
    if (!ArtistaService.instance) {
      ArtistaService.instance = new ArtistaService();
    }
    return ArtistaService.instance;
  }

  async listarArtistasParaDropdown(): Promise<ArtistaDropdown[]> {
    try {
      return await this.artistaRepository.listarNombres() as any; // mantiene compatibilidad
    } catch (error) {
      throw new CustomError("Error al obtener los artistas", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Nuevo: crear artista con validaciones básicas
  async crearArtista(data: { nombre: string; duracionMin: number; categoriaId: number; prioridad: number; }): Promise<any> {
    const { nombre, duracionMin, categoriaId, prioridad } = data;
    if (!nombre || !nombre.trim()) {
      throw new CustomError("El nombre es obligatorio", StatusCodes.BAD_REQUEST);
    }
    if (!Number.isInteger(duracionMin) || duracionMin <= 0) {
      throw new CustomError("La duración (min) debe ser un entero positivo", StatusCodes.BAD_REQUEST);
    }
    if (!Number.isInteger(prioridad) || prioridad < 0) {
      throw new CustomError("La prioridad debe ser un entero >= 0", StatusCodes.BAD_REQUEST);
    }
    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      throw new CustomError("La categoría es obligatoria", StatusCodes.BAD_REQUEST);
    }
    try {
      const categoriaRepo = CategoriaRepository.getInstance();
      const categoria = await categoriaRepo.buscarPorId(categoriaId);
      if (!categoria) {
        throw new CustomError("La categoría no existe", StatusCodes.BAD_REQUEST);
      }
      const nuevo = await this.artistaRepository.crear({
        nombre: nombre.trim(),
        duracionMin,
        prioridad,
        categoria,
      });
      return nuevo;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Error al crear artista", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const artistaService = ArtistaService.getInstance();