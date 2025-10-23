import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Rol } from "../enums/Rol";
import { PasswordHasher } from "@/types/PasswordHasher";

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  dni: string;
  @Column()
  email: string;
  @Column()
  nombre: string;
  @Column()
  apellidoPaterno: string;
  @Column()
  apellidoMaterno: string;
  @Column()
  celular: string;
  @Column()
  password: string;
  @Column({ type: "enum", enum: Rol })
  rol: Rol;
  @Column()
  activo: boolean;

  public async hashearPassword() {
    this.password = await PasswordHasher.hash(this.password);
  }

  public activar(){
    this.activo = true;
  }

  public desactivar(){
    this.activo = false;
  }

}