import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { TipoAccion } from "../enums/TipoAccion";

@Entity()
export class Acción {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "datetime" })
  fechaHora: Date;
  @Column()
  descripcion: string;
  @Column({ type: "enum", enum: TipoAccion })
  tipo: TipoAccion;
  @ManyToOne(() => Usuario, { onDelete: "CASCADE" })
  autor: Usuario;
}