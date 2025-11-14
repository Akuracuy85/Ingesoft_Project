import { AppDataSource } from "../database/data-source";
import { Repository, Between, FindOptionsWhere } from "typeorm";
import { Acción } from "../models/Acción"; 
import { Usuario } from "../models/Usuario";
import { TipoAccion } from "../enums/TipoAccion";

// Interfaz para definir los filtros de búsqueda
interface FiltrosAccion {
  fechaInicio?: Date;
  fechaFin?: Date;
  tipo?: TipoAccion;
  autorId?: number;
}

export class AccionRepository {
  private static instance: AccionRepository;
  private repository: Repository<Acción>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Acción);
  }

  public static getInstance(): AccionRepository {
    if (!AccionRepository.instance) {
      AccionRepository.instance = new AccionRepository();
    }
    return AccionRepository.instance;
  }


  async crearAccion(data: Partial<Acción>): Promise<Acción> {
    const nuevaAccion = this.repository.create(data);
    return await this.repository.save(nuevaAccion);
  }
    

  async buscarTodasLasAcciones(filtros: FiltrosAccion = {}): Promise<Acción[]> {
    
    const whereClause: FindOptionsWhere<Acción> = {};


    if (filtros.fechaInicio && filtros.fechaFin) {
      whereClause.fechaHora = Between(filtros.fechaInicio, filtros.fechaFin);
    } else if (filtros.fechaInicio) {
        // Si solo hay inicio, buscamos desde esa fecha en adelante
        whereClause.fechaHora = MoreThanOrEqual(filtros.fechaInicio);
    } else if (filtros.fechaFin) {
        // Si solo hay fin, buscamos hasta esa fecha
        whereClause.fechaHora = LessThanOrEqual(filtros.fechaFin);
    }


    // 2. Filtro por Tipo de Acción
    if (filtros.tipo) {
      whereClause.tipo = filtros.tipo;
    }

    // 3. Filtro por Usuario/Autor (relación)
    if (filtros.autorId) {
      // Filtramos en la relación 'autor' por su ID
      whereClause.autor = { id: filtros.autorId } as FindOptionsWhere<Usuario>;
    }

    return await this.repository.find({

      relations: ["autor"], 
      where: whereClause,
      order: { fechaHora: "DESC" } 
    });
  }
  

  async buscarPorId(id: number): Promise<Acción | null> {
    return await this.repository.findOne({ where: { id }, relations: ["autor"] });
  }

}

import { MoreThanOrEqual, LessThanOrEqual } from "typeorm";