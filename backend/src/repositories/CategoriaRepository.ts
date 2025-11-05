// src/repositories/CategoriaRepository.ts
import { AppDataSource } from "@/database/data-source";
import { Categoria } from "@/models/Categoria";
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
}

export const categoriaRepository = CategoriaRepository.getInstance();