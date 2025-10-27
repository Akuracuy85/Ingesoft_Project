import { AppDataSource } from "@/database/data-source";
import { Evento } from "@/models/Evento";
import { Repository } from "typeorm";

export type EventoBasico = Pick<Evento, "nombre" | "fechaEvento" | "estado">;

export class EventoRepository {
  private static instance: EventoRepository;
  private repository: Repository<Evento>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Evento);
  }

  public static getInstance(): EventoRepository {
    if (!EventoRepository.instance) {
      EventoRepository.instance = new EventoRepository();
    }
    return EventoRepository.instance;
  }

  async obtenerDatosBasicos(): Promise<EventoBasico[]> {
    return await this.repository.find({
      select: {
        nombre: true,
        fechaEvento: true,
        estado: true,
      },
      order: { fechaEvento: "ASC" },
    });
  }

  async crearEvento(data: Partial<Evento>): Promise<Evento> {
    const evento = this.repository.create(data);
    return await this.repository.save(evento);
  }
}
