import { Usuario } from "@/models/Usuario";
import { PerfilRepository } from "@/repositories/PerfilRepository";
import { TarjetaRepository } from "@/repositories/TarjetaRepository";
import { CustomError } from "@/types/CustomError";
import { PasswordHasher } from "@/types/PasswordHasher";
import { StatusCodes } from "http-status-codes";

export class PerfilService {
    private static instance: PerfilService;
    private perfilRepository: PerfilRepository;
    private tarjetaRepository: TarjetaRepository;

    private constructor() {
        this.perfilRepository = PerfilRepository.getInstance();
        this.tarjetaRepository = TarjetaRepository.getInstance();
    }

    public static getInstance(): PerfilService {
        if (!PerfilService.instance) {
            PerfilService.instance = new PerfilService();
        }
        return PerfilService.instance;
    }

    /**
     * Obtiene los datos del perfil del usuario, incluyendo sus tarjetas.
     * @param userId - ID del usuario autenticado.
     */
    public async obtenerPerfilUsuario(userId: number): Promise<Usuario> {
        // Usamos el nuevo método que trae las tarjetas
        const usuario = await this.perfilRepository.buscarPorIdConTarjetas(userId);

        if (!usuario) {
            throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
        }

        return usuario;
    }

    public async actualizarPerfilUsuario(
        userId: number,
        nuevosDatos: { nombre?: string; email?: string; password?: string; passwordActual?: string }
    ): Promise<void> {
        // 1. Determinar qué método de búsqueda usar
        // Si se intenta cambiar la contraseña, debemos cargar el hash actual para validar.
        let usuario: Usuario | null;
        if (nuevosDatos.password) {
            // Usa el método del Repository que carga explícitamente el password
            usuario = await this.perfilRepository.buscarPorIdConPassword(userId);
        } else {
            // Si solo se actualiza nombre/email, no necesitamos cargar el password
            usuario = await this.perfilRepository.buscarPorId(userId);
        }

        if (!usuario) {
            throw new CustomError("Usuario no encontrado", StatusCodes.NOT_FOUND);
        }

        // 2.Lógica de Actualización de Contraseña
        if (nuevosDatos.password) {
            // Verificar si se proporcionó la contraseña actual
            if (!nuevosDatos.passwordActual) {
                throw new CustomError("Debe proporcionar la contraseña actual para cambiarla.", StatusCodes.BAD_REQUEST);
            }
            
            // Validar la contraseña actual con el hash almacenado
            // El campo 'usuario.password' estará disponible aquí gracias a buscarPorIdConPassword
            const isMatch = await PasswordHasher.verificar(nuevosDatos.passwordActual, usuario.password);
            
            if (!isMatch) {
                throw new CustomError("La contraseña actual es incorrecta.", StatusCodes.UNAUTHORIZED);
            }
            
            // Hashear y reemplazar la nueva contraseña para guardarla
            nuevosDatos.password = await PasswordHasher.hash(nuevosDatos.password);
            
            // Eliminar la contraseña actual del objeto de datos para que no se envíe a la base de datos
            delete nuevosDatos.passwordActual; 
        }

        // 3. Lógica de Actualización de Email (Tu lógica existente)
        if (nuevosDatos.email && nuevosDatos.email !== usuario.email) {
            const emailEnUso = await this.perfilRepository.emailEnUso(nuevosDatos.email, userId);
            if (emailEnUso) {
                throw new CustomError("El email ya está en uso", StatusCodes.CONFLICT);
            }
        }

        

        // 4. Actualizar el perfil en la base de datos
        // Si 'password' no se proporcionó, no afectará a la columna.
        // Si 'password' se proporcionó, aquí se guardará el nuevo hash.
        await this.perfilRepository.actualizarPerfil(userId, nuevosDatos);
    }

    /**
     * Verifica la propiedad de una tarjeta por el ID del usuario y el ID de la tarjeta, y luego la elimina.
     * @param userId - ID del usuario autenticado (dueño de la tarjeta).
     * @param tarjetaId - ID de la tarjeta a eliminar (obtenido de los parámetros de la ruta).
     */
    public async eliminarTarjetaUsuario(userId: number, tarjetaId: number): Promise<void> {
        // 1. Usar TarjetaRepository para verificar la propiedad.
        // Si la tarjeta existe Y pertenece al userId, la devuelve. Si no, devuelve null.
        const tarjeta = await this.tarjetaRepository.buscarPorIdYCliente(tarjetaId, userId);

        if (!tarjeta) {
            // Este mensaje cubre dos casos: 
            // 1) La tarjeta no existe. 
            // 2) La tarjeta existe, pero no pertenece al usuario autenticado. 
            // Ambos son NOT_FOUND o UNAUTHORIZED, usando NOT_FOUND es más seguro.
            throw new CustomError("Tarjeta no encontrada o no pertenece al usuario.", StatusCodes.NOT_FOUND);
        }
        await this.tarjetaRepository.eliminar(tarjetaId);
    }
    
}