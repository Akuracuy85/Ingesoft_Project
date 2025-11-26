import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Provincia {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @ManyToOne(() => Departamento, (departamento) => departamento.provincias)
  departamento: Departamento;
}