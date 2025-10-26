import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Evento } from "./Evento";

@Entity()
export class Entrada {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  codigoQR: string;
  @Column()
  dniCliente: string;
  @Column()
  tipoEntrada: string;
  @ManyToOne(() => Evento, evento => evento.entradas, { onDelete: "CASCADE" })
  evento: Evento;
}