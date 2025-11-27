
import { Departamento } from "../models/Departamento";
import { AppDataSource } from "../database/data-source";
import { Repository } from "typeorm";

export class UbicacionesRepository {
  private static instance: UbicacionesRepository;
  private departamentoRepository: Repository<Departamento>;

  private constructor() {
    this.departamentoRepository = AppDataSource.getRepository(Departamento);
  }

  public static getInstance(): UbicacionesRepository {
    if (!UbicacionesRepository.instance) {
      UbicacionesRepository.instance = new UbicacionesRepository();
    }
    return UbicacionesRepository.instance;
  }

  async listarDepartamentos(): Promise<Departamento[]> {
    return await this.departamentoRepository.find({
      relations: {
        provincias: {
          distritos: true,
        }
      },
      order: { nombre: "ASC" }
    });
  }

}

export const ubicacionesRepository = UbicacionesRepository.getInstance();