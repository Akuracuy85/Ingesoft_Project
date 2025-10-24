import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Categoria } from "./Categoria";

@Entity()
export class Artista {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  duracionMin: number;
  @ManyToOne(() => Categoria, { onDelete: "CASCADE" })
  categoria: Categoria;
  @Column({ type: "int" })
  prioridad: number;
}