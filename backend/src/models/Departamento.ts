import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Departamento {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
}