import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TokenRecuperacion {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
}