import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Cliente } from "./Cliente";

@Entity()
export class Tarjeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  numeroCuenta: number;

  @ManyToOne(() => Cliente, cliente => cliente.tarjetas, { onDelete: "CASCADE" })
  cliente: Cliente;
}