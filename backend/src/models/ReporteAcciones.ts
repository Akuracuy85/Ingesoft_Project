import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ReporteAcciones {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "datetime" })
  fechaInicio: Date;
  @Column({ type: "datetime" })
  fechaFin: Date;
  @Column()
  TipoAcciones: string;
}