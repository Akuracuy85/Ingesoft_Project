import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @Column({ type: "int" })
  capacidad: number;
  @Column()
  ubicacion: string;
}