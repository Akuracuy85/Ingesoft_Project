import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EstadoTransaccion } from "../enums/EstadoTransaccion";
import { MetodoPago } from "../enums/MetodoPago";

@Entity()
export class TransaccionPago {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  monto: number;
  @Column({ type: "enum", enum: EstadoTransaccion })
  estado: EstadoTransaccion;
  @Column({ type: "datetime" })
  fechaTransaccion: Date;
  @Column({ type: "enum", enum: MetodoPago })
  metodoPago: MetodoPago;
}