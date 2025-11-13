import { AccionRepository } from "@/repositories/AccionRepository"; // Asume la ruta
import { TipoAccion } from "@/enums/TipoAccion"; // Asume la ruta
import { Acción } from "@/models/Acción"; // Asume la ruta
import { Usuario } from "@/models/Usuario";
import { CustomError } from "@/types/CustomError";
import { StatusCodes } from "http-status-codes";

// Interfaz para definir los filtros que recibe el Service
export interface FiltrosAccionService {
    fechaInicio?: string; // Usamos string para representar la fecha de entrada (ISO)
    fechaFin?: string;    // Usamos string para representar la fecha de entrada (ISO)
    tipo?: TipoAccion;
    autorId?: number;
}

export class AccionService {
    private static instance: AccionService;
    private accionRepository: AccionRepository;

    private constructor() {
        this.accionRepository = AccionRepository.getInstance();
    }

    public static getInstance(): AccionService {
        if (!AccionService.instance) {
            AccionService.instance = new AccionService();
        }
        return AccionService.instance;
    }

    // -----------------------------------------------------
    // FUNCIONALIDAD ADICIONAL: Registro de Acción (logging)
    // -----------------------------------------------------

    /**
     * @description Registra una acción administrativa en la base de datos.
     * @param descripcion - Descripción detallada de lo que sucedió.
     * @param tipo - El tipo de acción (CREATE, UPDATE, DELETE, etc.).
     * @param autor - El objeto Usuario que realizó la acción.
     * @returns La acción registrada.
     */
    async registrarAccion(
        descripcion: string,
        tipo: TipoAccion,
        autor: Usuario
    ): Promise<Acción> {
        try {
            const data: Partial<Acción> = {
                descripcion,
                tipo,
                autor,
                fechaHora: new Date(),
            };
            return await this.accionRepository.crearAccion(data);
        } catch (error) {
            // No lanzamos un CustomError ya que el logging no debería detener la operación principal.
            console.error("Error FATAL al registrar acción:", error);
            // Podrías considerar guardar el error en un log de sistema alternativo.
            throw new CustomError(
                "Error interno al registrar la acción administrativa.",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async buscarAccionesAdministradores(filtros: FiltrosAccionService = {}): Promise<Acción[]> {
        try {
            let fechaInicio: Date | undefined;
            let fechaFin: Date | undefined;

            // 1. Parsear las fechas de string a objeto Date
            if (filtros.fechaInicio) {
                fechaInicio = new Date(filtros.fechaInicio);
                if (isNaN(fechaInicio.getTime())) {
                    throw new CustomError("Formato de fecha de inicio inválido.", StatusCodes.BAD_REQUEST);
                }
            }

            if (filtros.fechaFin) {
                fechaFin = new Date(filtros.fechaFin);
                if (isNaN(fechaFin.getTime())) {
                    throw new CustomError("Formato de fecha de fin inválido.", StatusCodes.BAD_REQUEST);
                }
            }

            // 2. Comprobar que el rango de fechas sea válido
            if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
                throw new CustomError("La fecha de inicio no puede ser posterior a la fecha de fin.", StatusCodes.BAD_REQUEST);
            }

            // 3. Llamar al repositorio con los filtros formateados
            const acciones = await this.accionRepository.buscarTodasLasAcciones({
                fechaInicio,
                fechaFin,
                tipo: filtros.tipo,
                autorId: filtros.autorId,
            });

            return acciones;

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError(
                "Error al obtener el historial de acciones.",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export const accionService = AccionService.getInstance();