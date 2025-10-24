import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Entrada {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  codigoQR: string;
  @Column()
  dniCliente: string;
  @Column()
  tipoEntrada: string;
}