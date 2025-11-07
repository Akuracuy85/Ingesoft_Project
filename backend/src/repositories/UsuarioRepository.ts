import { AppDataSource } from "@/database/data-source";
import { Rol } from "@/enums/Rol";
import { Usuario } from "@/models/Usuario";
import { Cliente } from "@/models/Cliente";
import { Organizador } from "@/models/Organizador";
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
    return await this.repository.findOne({ where: { id } });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return await this.repository
      .createQueryBuilder("usuario")
      .addSelect("usuario.password")
      .where("usuario.email = :email", { email })
      .getOne();
  }

  async buscarPorDNI(dni: string): Promise<Usuario | null> {
    return await this.repository.findOneBy({ dni });
  }

  async buscarPorRol(rol: Rol): Promise<Usuario[]> {
    return await this.repository.findBy({ rol });
  }

  async crearUsuario(data: Partial<Usuario>): Promise<Usuario> {
    let usuario: Usuario;
    switch (data.rol) {
      case Rol.CLIENTE:
        usuario = this.repository.create(data as Cliente);
        break;
      case Rol.ORGANIZADOR:
        usuario = this.repository.create(data as Organizador);
        break;
      default:
        usuario = this.repository.create(data);
    }
    return await this.repository.save(usuario);
  }

  async actualizarUsuario(id: number, data: Partial<Usuario>){
    await this.repository.update(id, data);
  }

  async borrarUsuario(usuario: Usuario): Promise<void> {
    await this.repository.delete({ id : usuario.id });
  }

  async getAllUser(): Promise<Usuario[]> {
    return await this.repository.find();
  }
}