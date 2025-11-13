import { VerificarTurnoRepository, InfoTurnoCliente } from "../repositories/VerificarTurnoRepository";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";

export class VerificarTurnoService {
  private static instance: VerificarTurnoService;
  private verificarTurnoRepository: VerificarTurnoRepository;

  private constructor() {
    // Usamos el repositorio con el nombre actualizado
    this.verificarTurnoRepository = VerificarTurnoRepository.getInstance();
  }

  public static getInstance(): VerificarTurnoService {
    if (!VerificarTurnoService.instance) {
      VerificarTurnoService.instance = new VerificarTurnoService();
    }
    return VerificarTurnoService.instance;
  }

  /**
   * @description Obtiene el puesto en el turno del evento especificado y los puntos del cliente.
   * @param userId - ID del cliente autenticado.
   * @param eventoId - ID del evento cuya cola se quiere consultar.
   * @returns Objeto con la posición en cola (o null) y los puntos actuales.
   */
  public async obtenerInformacionTurno(userId: number, eventoId: number): Promise<InfoTurnoCliente> {

    const infoTurno = await this.verificarTurnoRepository.obtenerPosicionYpuntos(
      userId,
      eventoId
    );
    if (infoTurno.posicionCola === null) {
      throw new CustomError("No se encontró un turno activo para este evento.", StatusCodes.NOT_FOUND);
    }

    return infoTurno;
  }
}