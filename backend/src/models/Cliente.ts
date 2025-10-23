import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tarjeta } from "./Tarjeta";

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "int" })
  puntos: number;
  @ManyToOne(() => Tarjeta, { onDelete: "CASCADE" })
  tarjetas: Tarjeta;
}