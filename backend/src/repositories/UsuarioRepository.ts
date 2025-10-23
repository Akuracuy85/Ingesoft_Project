import { AppDataSource } from "@/database/data-source";
import { Rol } from "@/enums/Rol";
import { Usuario } from "@/models/Usuario";
import { Repository } from "typeorm";

export class UsuarioRepository {
  private static instance: UsuarioRepository;
  private repository: Repository<Usuario>;

  private constructor() {
    this.repository = AppDataSource.getRepository(Usuario);
  }

  public static getInstance(): UsuarioRepository {
    if (!UsuarioRepository.instance) {
      UsuarioRepository.instance = new UsuarioRepository();
    }
    return UsuarioRepository.instance;
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    return await this.repository.findOneBy({ id });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return await this.repository.findOneBy({ email });
  }

  async buscarPorDNI(dni: string): Promise<Usuario | null> {
    return await this.repository.findOneBy({ dni });
  }

  async buscarPorRol(rol: Rol): Promise<Usuario[]> {
    return await this.repository.findBy({ rol });
  }

  async crearUsuario(data: Partial<Usuario>): Promise<Usuario> {
    const user = this.repository.create(data);
    return await this.repository.save(user);
  }

  async actualizarUsuario(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    await this.repository.update(id, data);
    return await this.buscarPorId(id);
  }

  async borrarUsuario(usuario: Usuario): Promise<void> {
    await this.repository.delete({ id : usuario.id });
  }
}