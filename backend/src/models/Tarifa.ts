import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tarifa {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  precio: number;
  @Column({ type: "datetime" })
  fechaInicio: Date;
  @Column({ type: "datetime" })
  fechaFin: Date;
}