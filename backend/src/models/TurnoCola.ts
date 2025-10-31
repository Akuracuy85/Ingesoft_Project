import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

import { Cliente } from "./Cliente";
import { Cola } from "./Cola";

@Entity()
export class TurnoCola {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "int" })
  posicion: number;
  @Column({ type: "datetime" })
  ingreso: Date;
  @Column()
  estado: string;
  @ManyToOne(() => Cliente, { nullable: false, onDelete: "CASCADE" })
  cliente: Cliente;
  @ManyToOne(() => Cola, { nullable: false, onDelete: "CASCADE" })
  cola: Cola;
}