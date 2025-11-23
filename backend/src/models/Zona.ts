import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Evento } from "./Evento";
import { Tarifa } from "./Tarifa";

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

  @OneToOne(() => Tarifa, { nullable: true, cascade: ["insert", "update"] })
  @JoinColumn()
  tarifaNormal?: Tarifa | null;

  @OneToOne(() => Tarifa, { nullable: true, cascade: ["insert", "update"] })
  @JoinColumn()
  tarifaPreventa?: Tarifa | null;

  @ManyToOne(() => Evento, (evento) => evento.zonas, { onDelete: "CASCADE" })
  evento: Evento;
}
