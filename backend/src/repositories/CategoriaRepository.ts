// src/repositories/CategoriaRepository.ts
import { AppDataSource } from "../database/data-source";
import { Categoria } from "../models/Categoria";
import { Repository } from "typeorm";

export class CategoriaRepository {
  private static instance: CategoriaRepository;
  private repository: Repository<Categoria>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Categoria);
  }

  public static getInstance(): CategoriaRepository {
    if (!CategoriaRepository.instance) {
      CategoriaRepository.instance = new CategoriaRepository();
    }
    return CategoriaRepository.instance;
  }

  async listarTodas(): Promise<Categoria[]> {
    return await this.repository.find({
      order: { nombre: "ASC" } // Ordenar alfabéticamente
    });
  }

  // Nuevo: buscar por id
  async buscarPorId(id: number): Promise<Categoria | null> {
    if (!Number.isInteger(id) || id <= 0) return null;
    return await this.repository.findOne({ where: { id } });
  }

  // Crear categoría
  async crear(data: Partial<Categoria>): Promise<Categoria> {
    const entidad = this.repository.create(data);
    return await this.repository.save(entidad);
  }
}

export const categoriaRepository = CategoriaRepository.getInstance();