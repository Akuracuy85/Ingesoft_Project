import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cliente } from "./Cliente";

@Entity()
export class Calificacion {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  puntuacion: number;
  @ManyToOne(() => Cliente, { onDelete: "CASCADE" })
  cliente: Cliente;
  @Column()
  comentario: string;
}