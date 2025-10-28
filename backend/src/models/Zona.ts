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

  @Column({ type: "int", default: 0 })
  cantidadComprada: number;

  // El costo se almacena en centimos para evitar perdidas por decimales.
  @Column({ type: "int", default: 0 })
  costo: number;

  @ManyToOne(() => Evento, (evento) => evento.zonas)
  evento: Evento;
}
