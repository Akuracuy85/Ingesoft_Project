import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Zona } from "./Zona";

@Entity()
export class MetricaCola {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "int" })
  tiempoEsperaPromedio: number;
  @Column({ type: "int" })
  clientesEnCola: number;
  @ManyToOne(() => Zona, { onDelete: "CASCADE" })
  zona: Zona;
}