import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Cliente } from "./Cliente";

@Entity()
export class Tarjeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 16 })
  numeroTarjeta: string;

  @Column({ type: "int" })
  mesExp: number;

  @Column({ type: "int" })
  anExp: number;

  @Column({ type: "varchar", length: 4 })
  cvv: string;

  @ManyToOne(() => Cliente, cliente => cliente.tarjetas, { onDelete: "CASCADE" })
  cliente: Cliente;
}