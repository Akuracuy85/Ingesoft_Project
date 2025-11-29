import {
  Column,
  Entity,
  Index,
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
import { OrdenCompra } from "./OrdenCompra";

@Entity()
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  nombre: string;
  
  @Column()
  descripcion: string;
  
  @Column({ type: "datetime" })
  @Index()
  fechaEvento: Date;
  
  @Column({type: "text"})
  lugar: string;
  
  @Column({ type: "varchar", length: 100 })
  @Index()
  departamento: string;

  @Column({type: "varchar", length: 100})
  @Index()
  provincia: string;

  @Column({type: "varchar", length: 100})
  @Index()
  distrito: string;

  @Column({ type: "enum", enum: EstadoEvento })
  estado: EstadoEvento;

  @Column({ type: "datetime" })
  fechaPublicacion: Date;

  // NUEVO: fecha inicio y fin de preventa global (nullable para eventos antiguos)
  @Column({ type: "datetime", nullable: true })
  fechaInicioPreventa?: Date | null;
  @Column({ type: "datetime", nullable: true })
  fechaFinPreventa?: Date | null;

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

  @Column({ type: "varchar", length: 512, nullable: true })
  imagenBanner: string;

  @Column({ type: "varchar", length: 512, nullable: true })
  imagenLugar: string;

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

  @OneToMany(() => OrdenCompra, orden => orden.evento)
  ordenesCompra: OrdenCompra[];
}
