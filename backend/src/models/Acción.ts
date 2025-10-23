import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity()
export class Acción {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "datetime" })
  fechaHora: Date;
  @Column()
  descripcion: string;
  @ManyToOne(() => Usuario, { onDelete: "CASCADE" })
  autor: Usuario;
}