import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class EmailEnvio {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  servidorSMTP: string;
  @Column({ type: "int" })
  puerto: number;
  @Column()
  remitente: string;
}