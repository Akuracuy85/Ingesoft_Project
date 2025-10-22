import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombreArchivo: string;
  @Column()
  tipo: string;
  @Column({ type: "int" })
  tamano: number;
  @Column()
  url: string;
}