import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Reporte {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "datetime" })
  fechaInicio: Date;
  @Column({ type: "datetime" })
  fechaFin: Date;
}