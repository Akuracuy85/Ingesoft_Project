import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tarjeta {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "int" })
  numeroCuenta: number;
}