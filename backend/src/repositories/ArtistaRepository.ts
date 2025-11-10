// src/repositories/ArtistaRepository.ts

import { AppDataSource } from "../database/data-source";
import { Artista } from "../models/Artista";
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

  /**
   * Devuelve ID, Nombre y la relación 'categoria' completa para el filtrado en cascada.
   * El frontend necesita categoria.id para saber a qué grupo pertenece el artista.
   */
  async listarNombres(): Promise<Artista[]> { // Cambiamos el tipo de retorno a Artista[] para incluir la relación
    return await this.repository.find({
      select: {
            // Campos principales necesarios
          id: true, 
          nombre: true,
            // 🛑 CLAVE 1: Seleccionar solo el ID de la categoría para optimizar
            categoria: { id: true, nombre: true } // Selecciona los campos necesarios de la relación
      },
      relations: ['categoria'], // 🛑 CLAVE 2: Asegurar que la relación 'categoria' se carga
      order: { nombre: "ASC" }
    });
  }
}

export const artistaRepository = ArtistaRepository.getInstance();