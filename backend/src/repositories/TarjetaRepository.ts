import { AppDataSource } from "../database/data-source";
import { Tarjeta } from "../models/Tarjeta";
import { Repository } from "typeorm";
import { Cliente } from "../models/Cliente"; // Necesario para el tipo de la relación

export class TarjetaRepository {
    private static instance: TarjetaRepository;
    private repository: Repository<Tarjeta>;

    private constructor() {
        this.repository = AppDataSource.getRepository(Tarjeta);
    }

    public static getInstance(): TarjetaRepository {
        if (!TarjetaRepository.instance) {
            TarjetaRepository.instance = new TarjetaRepository();
        }
        return TarjetaRepository.instance;
    }

    /**
     * Busca una tarjeta por su ID y el ID de su dueño (cliente).
     * @param tarjetaId - ID de la tarjeta.
     * @param clienteId - ID del cliente (usuario) dueño.
     * @returns La tarjeta encontrada o null.
     */
    async buscarPorIdYCliente(tarjetaId: number, clienteId: number): Promise<Tarjeta | null> {
        // La consulta verifica que la tarjeta exista Y pertenezca al cliente.
        return await this.repository.findOne({
            where: {
                id: tarjetaId,
                cliente: { id: clienteId }, 
            },
            // relations: ["cliente"] // No es necesario cargar el cliente si solo se usa para el WHERE
        });
    }

    async insertarTarjeta(tarjeta: Tarjeta): Promise<Tarjeta> {
        return await this.repository.save(tarjeta);
    }
    
    /**
     * Elimina una tarjeta por su ID.
     * @param tarjetaId - ID de la tarjeta a eliminar.
     */
    async eliminar(tarjetaId: number): Promise<void> {
        await this.repository.delete(tarjetaId);
    }
}

export const tarjetaRepository = TarjetaRepository.getInstance();