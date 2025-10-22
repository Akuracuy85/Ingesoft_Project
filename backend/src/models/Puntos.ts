import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Puntos {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "int" })
  cantPuntos: number;
  @Column({ type: "datetime" })
  fecha: Date;
}