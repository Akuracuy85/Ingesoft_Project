// src/repositories/ArtistaRepository.ts
import { AppDataSource } from "@/database/data-source";
import { Artista } from "@/models/Artista";
import { Repository } from "typeorm";

export class ArtistaRepository {
  private static instance: ArtistaRepository;
  private repository: Repository<Artista>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Artista);
  }

  public static getInstance(): ArtistaRepository {
    if (!ArtistaRepository.instance) {
      ArtistaRepository.instance = new ArtistaRepository();
    }
    return ArtistaRepository.instance;
  }

  // Devuelve solo ID y Nombre, que es lo que el dropdown necesita
  async listarNombres(): Promise<Pick<Artista, 'id' | 'nombre'>[]> {
    return await this.repository.find({
      select: ["id", "nombre"],
      order: { nombre: "ASC" }
    });
  }
}

export const artistaRepository = ArtistaRepository.getInstance();