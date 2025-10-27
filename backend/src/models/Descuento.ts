import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Descuento {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  tipo: string;
  @Column({ type: "int"})//cambiado
  valor: number;
  @Column({ type: "datetime" })
  fechaInicio: Date;
  @Column({ type: "datetime" })
  fechaFin: Date;
  @Column()
  estado: string;
}