// CAMBIO: [2025-10-26] - Creado ZonaRepository
// Se crea para manejar el acceso a datos de Zonas,
// especialmente para buscar zonas y validar stock.
import { AppDataSource } from "../database/data-source";
import { Zona } from "../models/Zona";
import { Repository } from "typeorm";

export class ZonaRepository {
  private static instance: ZonaRepository;
  private repository: Repository<Zona>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Zona);
  }

  public static getInstance(): ZonaRepository {
    if (!ZonaRepository.instance) {
      ZonaRepository.instance = new ZonaRepository();
    }
    return ZonaRepository.instance;
  }

  async buscarPorId(id: number): Promise<Zona | null> {
    return await this.repository.findOneBy({ id });
  }

  async buscarMultiplesPorIds(ids: number[]): Promise<Zona[]> {
    if (ids.length === 0) return [];
    
    return await this.repository
      .createQueryBuilder("zona")
      // 🛑 CORRECCIÓN CLAVE: Usar leftJoinAndSelect para cargar las tarifas
      .leftJoinAndSelect("zona.tarifaNormal", "tarifaNormal")
      .leftJoinAndSelect("zona.tarifaPreventa", "tarifaPreventa")
      .where("zona.id IN (:...ids)", { ids })
      .getMany();
  }
}

export const zonaRepository = ZonaRepository.getInstance();