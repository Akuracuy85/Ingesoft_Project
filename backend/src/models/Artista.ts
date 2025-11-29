import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Categoria } from "./Categoria";

@Entity()
export class Artista {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @ManyToOne(() => Categoria, { onDelete: "CASCADE" })
  @Index()
  categoria: Categoria;
  @Column({ type: "int" })
  prioridad?: number;
}