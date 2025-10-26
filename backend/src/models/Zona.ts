import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Evento } from "./Evento";

@Entity()
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @Column({ type: "int" })
  capacidad: number;
  @Column()
  cantidadComprada: number;
  @Column()
  costo: number;
  @ManyToOne(() => Evento, (evento) => evento.zonas)
  evento: Evento;
}