import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TokenSesion {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  valor: string;
  @Column({ type: "datetime" })
  fechaExpiracion: Date;
}