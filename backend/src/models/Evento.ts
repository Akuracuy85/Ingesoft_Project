import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Documento } from "./Documento";
import { EstadoEvento } from "../enums/EstadoEvento";
import { Zona } from "./Zona";
import { Entrada } from "./Entrada";

@Entity()
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombre: string;
  @Column()
  descripcion: string;
  @Column({ type: "datetime" })
  fechaEvento: Date;
  @Column({type: "text"})
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
  @Column({ type: "longblob", nullable: true })
  imagenBanner: Buffer;
  @Column({ type: "longblob", nullable: true })
  imagenLugar: Buffer;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  gananciaTotal: number;
  @OneToMany(() => Zona, zona => zona.evento, { cascade: true })
  zonas: Zona[];
  @OneToMany(() => Entrada, entrada => entrada.evento, { cascade: true})
  entradas: Entrada[];
}