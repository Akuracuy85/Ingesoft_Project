import { ColaRepository } from "../repositories/ColaRepository";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";

export class ColaService {
  private static instance: ColaService;
  private colaRepository: ColaRepository;

  private constructor() {
    this.colaRepository = ColaRepository.getInstance();
  }

  public static getInstance(): ColaService {
    if (!ColaService.instance) {
      ColaService.instance = new ColaService();
    }
    return ColaService.instance;
  }

  public async obtenerPosicion(userId: number, colaId: number): Promise<number> {

    let infoTurno = undefined;
    try {
      infoTurno = await this.colaRepository.obtenerPosicion(
        userId,
        colaId
      );
    } catch(e) {
      throw new CustomError("No se encontró un turno activo para este evento.", StatusCodes.NOT_FOUND);
    }

    return infoTurno;
  }

  public async actualizarHeartbeat(userId: number, colaId: number): Promise<void> {
    try {
      await this.colaRepository.actualizarHeartbeat(userId, colaId);
    } catch (error) {
      throw new CustomError("Error al actualizar el heartbeat del usuario.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  public async eliminarTurnosInactivos(): Promise<void> {
    try {
      await this.colaRepository.eliminarTurnosInactivos();
    } catch (error) {
      throw new CustomError("Error al eliminar turnos inactivos.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  public async crearCola(eventoId: number): Promise<void> {
    try {
      await this.colaRepository.crearCola(eventoId);
    } catch (error) {
        throw new CustomError("Error al crear la cola para el evento.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  public async ingresarUsuarioACola(userId: number, colaId: number): Promise<void> {
    try {
      await this.colaRepository.ingresarUsuarioACola(userId, colaId);
    } catch (error) {
      throw new CustomError("Error al ingresar el usuario a la cola.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  public async eliminarTurno(userId: number, colaId: number): Promise<void> {
    try {
      await this.colaRepository.eliminarTurno(userId, colaId);
    } catch (error) {
      throw new CustomError("Error al eliminar el turno del usuario.", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}