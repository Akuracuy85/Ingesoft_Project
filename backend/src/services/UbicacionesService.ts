import { UbicacionesRepository } from "../repositories/UbicacionesRepository";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";
import { Departamento } from "../models/Departamento";

export class UbicacionesService {
  private static instance: UbicacionesService;
  private ubicacionesRepository: UbicacionesRepository;

  private constructor() {
    this.ubicacionesRepository = UbicacionesRepository.getInstance();
  }

  public static getInstance(): UbicacionesService {
    if (!UbicacionesService.instance) {
      UbicacionesService.instance = new UbicacionesService();
    }
    return UbicacionesService.instance;
  }

  async listarDepartamentos(): Promise<Departamento[]> {
    try {
      return await this.ubicacionesRepository.listarDepartamentos();
    } catch (error) {
      throw new CustomError("Error al obtener los departamentos", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

}

export const ubicacionesService = UbicacionesService.getInstance();