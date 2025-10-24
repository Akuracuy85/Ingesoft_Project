import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SMSEnvio {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  numeroRemitente: string;
  @Column()
  proveedorSMS: string;
}