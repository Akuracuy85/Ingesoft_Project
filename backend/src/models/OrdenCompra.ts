import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  ManyToOne, 
  OneToMany, 
  PrimaryGeneratedColumn 
} from "typeorm";

import { Cliente } from "./Cliente";
import { Evento } from "./Evento";
import { EstadoOrden } from "../enums/EstadoOrden";
import { DetalleOrden } from "./DetalleOrden";

@Entity()
export class OrdenCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente)
  cliente: Cliente;

  @ManyToOne(() => Evento)
  evento: Evento;

  @OneToMany(() => DetalleOrden, (detalle) => detalle.orden, { cascade: true })
  detalles: DetalleOrden[];

  @Column({
    type: "enum",
    enum: EstadoOrden,
    default: EstadoOrden.PENDIENTE,
  })
  estado: EstadoOrden;

  @Column({ type: "int" })
  cantidadEntradas: number;

  @Column({ type: "int" })
  totalPagado: number; 

  @CreateDateColumn()
  createdAt: Date;
}