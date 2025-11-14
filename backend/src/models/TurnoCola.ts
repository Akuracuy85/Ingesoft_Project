import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from "typeorm";

import { Cliente } from "./Cliente";
import { Cola } from "./Cola";

@Entity()
@Unique(["cliente", "cola"])
export class TurnoCola {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "datetime" })
  ingreso: Date;
  @Column({ type: "datetime" })
  ultimoHeartbeat: Date;
  @ManyToOne(() => Cliente, { nullable: false, onDelete: "CASCADE" })
  cliente: Cliente;
  @ManyToOne(() => Cola, { nullable: false, onDelete: "CASCADE" })
  cola: Cola;
}