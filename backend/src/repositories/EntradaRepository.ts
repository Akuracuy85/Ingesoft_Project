// src/repositories/EntradaRepository.ts
import { AppDataSource } from "@/database/data-source";
import { Entrada } from "@/models/Entrada";
import { Repository } from "typeorm";

export class EntradaRepository {
  private static instance: EntradaRepository;
  private repository: Repository<Entrada>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Entrada);
  }

  public static getInstance(): EntradaRepository {
    if (!EntradaRepository.instance) {
      EntradaRepository.instance = new EntradaRepository();
    }
    return EntradaRepository.instance;
  }

  /**
   * Busca todas las entradas que coincidan con el DNI del cliente
   * y el ID del evento.
   */
  async findByDniAndEvento(dniCliente: string, eventoId: number): Promise<Entrada[]> {
    return await this.repository.find({
      where: {
        dniCliente: dniCliente,
        evento: { id: eventoId }
      },
      // Opcional: Carga la relación del evento si necesitas sus datos
      relations: ["evento"] 
    });
  }

  /**
   * Cuenta todas las entradas que coincidan con el DNI del cliente
   * y el ID del evento.
   */
  async countByDniAndEvento(dniCliente: string, eventoId: number): Promise<number> {
    return await this.repository.count({
      where: {
        dniCliente: dniCliente,
        evento: { id: eventoId }
      }
    });
  }
}

export const entradaRepository = EntradaRepository.getInstance();