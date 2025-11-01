import { VerificarTurnoRepository, InfoTurnoCliente } from "@/repositories/VerificarTurnoRepository";
import { CustomError } from "@/types/CustomError";
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
        
        // 1. Delegamos al Repository la obtención de la información combinada (posición y puntos).
        const infoTurno = await this.verificarTurnoRepository.obtenerPosicionYpuntos(
            userId, 
            eventoId
        );

        // 2. Manejo de Errores de Negocio:
        
        // Aunque el Repository ya maneja la lógica de puntos, aquí podrías verificar 
        // si el usuario fue encontrado, pero por ahora solo nos centramos en la información.
        
        // Si no se encontró un turno, podrías lanzar un error si la regla de negocio
        // exige que el usuario DEBA estar en una cola si está consultando:
        
        if (infoTurno.posicionCola === null) {
             throw new CustomError("No se encontró un turno activo para este evento.", StatusCodes.NOT_FOUND);
        }

        return infoTurno;
    }
}