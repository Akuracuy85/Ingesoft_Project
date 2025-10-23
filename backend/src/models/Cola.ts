import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cola {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "datetime" })
  creadoEn: Date;
  @Column()
  estado: string;
}