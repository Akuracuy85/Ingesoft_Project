import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Documento } from "./Documento";
import { EstadoEvento } from "../enums/EstadoEvento";

@Entity()
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @Column()
  descripcion: string;
  @Column({ type: "datetime" })
  fecha: Date;
  @Column()
  lugar: string;
  @Column({ type: "enum", enum: EstadoEvento })
  estado: EstadoEvento;
  @Column({ type: "datetime" })
  fechaPublicacion: Date;
  @Column({ type: "int" })
  aforoTotal: number;
  @Column({ type: "int" })
  entradasVendidas: number;
  @Column()
  codigoPrivado: string;
  @ManyToOne(() => Documento, { onDelete: "CASCADE" })
  terminosUso: Documento;
  @Column()
  imagen: string;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  gananciaTotal: number;
}