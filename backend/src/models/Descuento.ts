import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Descuento {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  tipo: string;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  valor: number;
  @Column({ type: "datetime" })
  fechaInicio: Date;
  @Column({ type: "datetime" })
  fechaFin: Date;
  @Column()
  estado: string;
}