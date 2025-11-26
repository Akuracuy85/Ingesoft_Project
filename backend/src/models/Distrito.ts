import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Provincia } from "./Provincia";

@Entity()
export class Distrito {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @ManyToOne(() => Provincia, (provincia) => provincia.distritos)
  provincia: Provincia;
}