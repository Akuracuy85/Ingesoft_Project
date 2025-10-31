import { AppDataSource } from "@/database/data-source";
import { TurnoCola } from "@/models/TurnoCola";
import { Repository } from "typeorm";
import { PerfilRepository } from "./PerfilRepository";
import { Cola } from "@/models/Cola";

// Interfaz para la respuesta combinada
export interface InfoTurnoCliente {
    posicionCola: number | null; // Null si no está en cola
    puntosActuales: number;
}

export class VerificarTurnoRepository {
    private static instance: VerificarTurnoRepository;
    private turnoColaRepository: Repository<TurnoCola>;
    private colaRepository: Repository<Cola>;
    private perfilRepository: PerfilRepository;

    private constructor() {
        this.turnoColaRepository = AppDataSource.getRepository(TurnoCola);
        this.colaRepository = AppDataSource.getRepository(Cola);
        this.perfilRepository = PerfilRepository.getInstance();
    }

    public static getInstance(): VerificarTurnoRepository {
        if (!VerificarTurnoRepository.instance) {
            VerificarTurnoRepository.instance = new VerificarTurnoRepository();
        }
        return VerificarTurnoRepository.instance;
    }

    /**
     * @description Busca la posición del cliente en el turno de un evento específico y sus puntos.
     * @param userId - ID del cliente.
     * @param eventoId - ID del evento cuya cola se quiere consultar.
     * @returns Un objeto con la posición en cola (o null) y los puntos actuales.
     */
    async obtenerPosicionYpuntos(userId: number, eventoId: number): Promise<InfoTurnoCliente> {
        let posicionCola: number | null = null;
        let puntosActuales = 0;

        // --- 1. Obtener la Cola (el contenedor) del Evento (OneToOne: Evento -> Cola) ---
        const colaEvento = await this.colaRepository.findOne({
            where: { evento: { id: eventoId } },
            select: ["id"], 
        });

        // --- 2. Obtener el TurnoCola (la posición) del Cliente ---
        if (colaEvento) {
            
            // Usamos QueryBuilder para filtrar por el ID del cliente y la ID de la cola del evento
            const turno = await this.turnoColaRepository.createQueryBuilder("turno")
                // Filtra por el ID del cliente (asumimos la relación clienteId existe en TurnoCola)
                .where("turno.clienteId = :userId", { userId })
                // Filtra por el ID de la cola (asumimos la relación colaId existe en TurnoCola)
                .andWhere("turno.colaId = :colaId", { colaId: colaEvento.id }) 
                .select("turno.posicion", "posicion")
                .getRawOne();
                
            if (turno) {
                posicionCola = turno.posicion;
            }
        }
        
        // --- 3. Obtener los Puntos del Cliente (Reutilizando PerfilRepository) ---
        try {
            const resultadoPuntos = await this.perfilRepository.buscarSoloPuntos(userId);
            if (resultadoPuntos) {
                puntosActuales = resultadoPuntos.puntos;
            }
        } catch (error) {
            // Manejo silencioso. Si el usuario no existe, devuelve 0 puntos.
        }

        // --- 4. Devolver la información combinada ---
        return {
            posicionCola: posicionCola,
            puntosActuales: puntosActuales,
        };
    }
}