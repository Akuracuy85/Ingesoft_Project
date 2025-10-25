import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Documento } from "./Documento";
import { EstadoEvento } from "../enums/EstadoEvento";
import { Zona } from "./Zona";
import { Entrada } from "./Entrada";
import { Artista } from "./Artista";
import { Cola } from "./Cola";
import { Calificacion } from "./Calificacion";

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
  @OneToOne(() => Documento, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn()
  terminosUso: Documento;
  @Column({ type: "longblob", nullable: true })
  imagenBanner: Buffer;
  @Column({ type: "longblob", nullable: true })
  imagenLugar: Buffer;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  gananciaTotal: number;
  @OneToMany(() => Zona, zona => zona.evento, { onDelete: "CASCADE" })
  zonas: Zona[];
  @OneToMany(() => Entrada, entrada => entrada.evento, { onDelete: "CASCADE" })
  entradas: Entrada[];
  @ManyToOne(() => Artista)
  artista: Artista;
  @OneToOne(() => Cola, cola => cola.evento)
  cola: Cola;
  @OneToMany(() => Calificacion, (calificacion) => calificacion.evento)
  calificaciones: Calificacion[];
}