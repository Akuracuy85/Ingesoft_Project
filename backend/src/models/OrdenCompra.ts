// CAMBIO: [2025-10-26] - Creada la entidad OrdenCompra
// CAMBIO: [2025-10-26] - Refactor: Simplificados los totales
// Se eliminan 'totalBruto', 'descuentoPuntos' y 'puntosUtilizados'
// para alinearse con la nueva lógica (puntos no se usan para descuento).
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

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalPagado: number; // Total final a pagar

  @CreateDateColumn()
  createdAt: Date;
}