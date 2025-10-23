import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Rol } from "../enums/Rol";

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "int" })
  dni: number;
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
  passwordHash: string;
  @Column({ type: "enum", enum: Rol })
  rol: Rol;
  @Column()
  activo: boolean;
}