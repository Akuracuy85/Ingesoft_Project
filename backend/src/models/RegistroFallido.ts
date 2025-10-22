import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RegistroFallido {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column({ type: "datetime" })
  fechaHora: Date;
  @Column()
  motivo: string;
}