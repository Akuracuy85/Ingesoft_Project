import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Documento } from "./Documento";
import { EstadoEvento } from "../enums/EstadoEvento";
import { Zona } from "./Zona";
import { Entrada } from "./Entrada";
import { Artista } from "./Artista";
import { Cola } from "./Cola";
import { Calificacion } from "./Calificacion";
import { Organizador } from "./Organizador";

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
  departamento: string;

  @Column({type: "text"})
  provincia: string;

  @Column({type: "text"})
  distrito: string;

  @Column({ type: "text", nullable: true })
  lugar: string | null;

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

  @OneToOne(() => Documento, {
    nullable: true,
    onDelete: "CASCADE",
    cascade: ["insert", "update"],
  })
  @JoinColumn()
  terminosUso?: Documento | null;

  @Column({ type: "longblob", nullable: true })
  imagenBanner: Buffer;

  @Column({ type: "longblob", nullable: true })
  imagenLugar: Buffer;

  @Column({ type: "int" })
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

  @ManyToOne(() => Organizador, (organizador) => organizador.eventos, {
    nullable: false,
    onDelete: "CASCADE",
  })

  @JoinColumn({ name: "organizadorId" })
  organizador: Organizador;

  // Colección de documentos adicionales ligados al evento (auto guarda/actualiza).
  @OneToMany(() => Documento, (documento) => documento.evento, {
    cascade: ["insert", "update"],
  })
  documentosRespaldo?: Documento[];
}
