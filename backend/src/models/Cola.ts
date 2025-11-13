import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Evento } from "./Evento";

@Entity()
export class Cola {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "datetime" })
  creadoEn: Date;
  @Column()
  activa: boolean;
  @OneToOne(() => Evento, evento => evento.cola, { onDelete: "CASCADE" })
  @JoinColumn()
  evento: Evento;
}