import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Provincia } from "./Provincia";

@Entity()
export class Departamento {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @OneToMany(() => Provincia, (provincia) => provincia.departamento)
  provincias: Provincia[];
}