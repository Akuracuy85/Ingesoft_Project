import { AppDataSource } from "@/database/data-source";
import { Usuario } from "@/models/Usuario";
import { Cliente } from "@/models/Cliente";
import { Repository } from "typeorm";

export class PerfilRepository {
  private static instance: PerfilRepository;
  private repository: Repository<Usuario>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Usuario);
  }

  public static getInstance(): PerfilRepository {
    if (!PerfilRepository.instance) {
      PerfilRepository.instance = new PerfilRepository();
    }
    return PerfilRepository.instance;
  }

  /**
   * Actualiza los datos del perfil del usuario.
   * @param id - ID del usuario.
   * @param nuevosDatos - Campos a actualizar.
   */
  async actualizarPerfil(id: number, nuevosDatos: Partial<Usuario>): Promise<void> {
    await this.repository.update(id, nuevosDatos);
  }  

  /**
     * Busca un usuario por su ID y carga explícitamente sus tarjetas.
     * @param id - ID del usuario.
     * @returns El usuario encontrado o null si no existe.
     */
    async buscarPorIdConTarjetas(id: number): Promise<Usuario | null> {
        return await this.repository.findOne({
            where: { id },
            // CLAVE: Cargar la relación 'tarjetas'
            relations: ["tarjetas"],
            // TypeORM necesita que sigas la ruta de la herencia para cargar las ChildEntities
        });
    }

    async buscarPorIdConPassword(id: number): Promise<Usuario | null> {
        return await this.repository
            .createQueryBuilder("usuario")
            .addSelect("usuario.password") // ANULA select: false
            .where("usuario.id = :id", { id })
            .getOne();
    }

  /**
   * Busca un usuario por su ID.
   * @param id - ID del usuario.
   * @returns El usuario encontrado o null si no existe.
   */
  async buscarPorId(id: number): Promise<Usuario | null> {
    return await this.repository.findOneBy({ id });
  }

  /**
   * Verifica si un email ya está en uso por otro usuario.
   * @param email - Email a verificar.
   * @param id - ID del usuario actual (para excluirlo de la verificación).
   * @returns True si el email está en uso, false en caso contrario.
   */
  async emailEnUso(email: string, id: number): Promise<boolean> {
    const usuario = await this.repository.findOne({
      where: { email },
      select: ["id"],
    });
    return usuario !== null && usuario.id !== id;
  }

  /**
     * Obtiene solo el campo 'puntos' para un cliente por su ID.
     * Utiliza QueryBuilder para una consulta optimizada y segura con herencia.
     * @param id - ID del cliente.
     * @returns Un objeto plano con el campo 'puntos' o null.
     */
    async buscarSoloPuntos(id: number): Promise<{ puntos: number } | null> {
        // 1. Obtener el repositorio específico de Cliente
        const resultado = await this.repository 
        .createQueryBuilder("usuario")
        // Seleccionamos la columna 'puntos' de la tabla 'usuario' (que es t1)
        .select("usuario.puntos", "puntos") 
        // Filtramos por ID
        .where("usuario.id = :id", { id })
        // Filtramos por el rol exacto que funciona en SQL
        .andWhere("usuario.rol = :rol", { rol: 'CLIENTE' })
        // Devolvemos el resultado sin intentar instanciar una entidad
        .getRawOne();

        return resultado || null;
    }
  

}