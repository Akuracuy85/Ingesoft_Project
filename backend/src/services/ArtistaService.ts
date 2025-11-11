// src/services/ArtistaService.ts
import { ArtistaRepository } from "../repositories/ArtistaRepository";
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
      return await this.artistaRepository.listarNombres();
    } catch (error) {
      throw new CustomError("Error al obtener los artistas", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const artistaService = ArtistaService.getInstance();