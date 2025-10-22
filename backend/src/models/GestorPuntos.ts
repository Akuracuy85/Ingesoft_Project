import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GestorPuntos {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  instancia: string;
}