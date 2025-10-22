import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TurnoCola {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "int" })
  posicion: number;
  @Column({ type: "datetime" })
  ingreso: Date;
  @Column()
  estado: string;
}