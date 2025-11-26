import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Departamento } from "./Departamento";
import { Distrito } from "./Distrito";

@Entity()
export class Provincia {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @ManyToOne(() => Departamento, (departamento) => departamento.provincias)
  departamento: Departamento;
  @OneToMany(() => Distrito, (distrito) => distrito.provincia)
  distritos: Distrito[];
}