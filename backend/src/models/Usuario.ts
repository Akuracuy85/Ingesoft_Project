import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from "typeorm";
import { Rol } from "../enums/Rol";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "tipo" } })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dni: string;

  @Column({ unique: true })
  email: string;

  @Column()
  nombre: string;

  @Column()
  apellidoPaterno: string;

  @Column()
  apellidoMaterno: string;

  @Column()
  celular: string;

  @Column({ select: false })
  password: string;

  @Column({ type: "enum", enum: Rol })
  rol: Rol;

  @Column()
  activo: boolean;

  public activar() {
    this.activo = true;
  }

  public desactivar() {
    this.activo = false;
  }
}