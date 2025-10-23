import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Organizador {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  RUC: string;
  @Column()
  RazonSocial: string;
}