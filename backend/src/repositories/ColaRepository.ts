import { AppDataSource } from "../database/data-source";
import { TurnoCola } from "../models/TurnoCola";
import { Repository } from "typeorm";
import { PerfilRepository } from "./PerfilRepository";
import { Cola } from "../models/Cola";

export class ColaRepository {
  private static instance: ColaRepository;
  private turnoColaRepository: Repository<TurnoCola>;
  private colaRepository: Repository<Cola>;
  private perfilRepository: PerfilRepository;

  private constructor() {
    this.turnoColaRepository = AppDataSource.getRepository(TurnoCola);
    this.colaRepository = AppDataSource.getRepository(Cola);
    this.perfilRepository = PerfilRepository.getInstance();
  }

  public static getInstance(): ColaRepository {
    if (!ColaRepository.instance) {
      ColaRepository.instance = new ColaRepository();
    }
    return ColaRepository.instance;
  }

  async obtenerPosicion(clienteId: number, colaId: number): Promise<number> {
    const turnos = await this.turnoColaRepository.find({
      where: { cola: { id: colaId } },
      order: { ingreso: "ASC" },
    });

    const index = turnos.findIndex(t => t.cliente.id === clienteId);
    if (index === -1) throw new Error("El cliente no está en la cola");
    return index + 1;
  }

  async actualizarHeartbeat(clienteId: number, colaId: number): Promise<void> {
    await this.turnoColaRepository.update(
      {
        cliente: { id: clienteId } as any,
        cola: { id: colaId } as any,
      },
      { ultimoHeartbeat: new Date() }
    );
  }

  async eliminarTurnosInactivos(): Promise<void> {
    const tiempoLimite = new Date(Date.now() - 60 * 1000);
    await this.turnoColaRepository
      .createQueryBuilder()
      .delete()
      .from(TurnoCola)
      .where("ultimoHeartbeat < :tiempoLimite", { tiempoLimite })
      .execute();
  }

  async crearCola(eventoId: number): Promise<Cola> {
    const nuevaCola = new Cola();
    nuevaCola.activa = true;
    nuevaCola.creadoEn = new Date();
    nuevaCola.evento = { id: eventoId } as any;

    return await this.colaRepository.save(nuevaCola);
  }

  async ingresarUsuarioACola(userId: number, eventoId: number): Promise<TurnoCola> {
    const colaEvento = await this.colaRepository.findOne({
      where: { evento: { id: eventoId } },
      select: ["id"],
    });
    if (!colaEvento) {
      throw new Error("Cola para el evento no encontrada.");
    }
    const nuevoTurno = new TurnoCola();
    nuevoTurno.cliente = { id: userId } as any;
    nuevoTurno.cola = colaEvento;
    nuevoTurno.ingreso = new Date();
    nuevoTurno.ultimoHeartbeat = new Date();
    return await this.turnoColaRepository.save(nuevoTurno);
  }

  async eliminarTurno(userId: number, colaId: number): Promise<void> {
    await this.turnoColaRepository.delete({
      cliente: { id: userId } as any,
      cola: { id: colaId } as any,
    });
  }
}