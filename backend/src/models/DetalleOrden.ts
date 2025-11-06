// CAMBIO: [2025-10-26] - Creada la entidad DetalleOrden
// Esta entidad almacena los items de una OrdenCompra (qué zona y cuántas entradas).
// CAMBIO: [2025-10-26] - Añadido campo 'dnis' (JSON)
// Se agrega la columna 'dnis' para almacenar el DNI de cada asistente,
// tal como lo solicita el flujo del frontend (Datos de Compra).
import { 
  Column, 
  Entity, 
  ManyToOne, 
  PrimaryGeneratedColumn 
} from "typeorm";
import { OrdenCompra } from "./OrdenCompra";
import { Zona } from "./Zona";

@Entity()
export class DetalleOrden {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrdenCompra, (orden) => orden.detalles)
  orden: OrdenCompra;

  @ManyToOne(() => Zona)
  zona: Zona;

  @Column({ type: "int" })
  cantidad: number;

  @Column({ type: "int" })
  precioUnitario: number; 

  @Column({ type: "int" }) 
  subtotal: number; 

  @Column({ type: "json", nullable: true })
  dnis: string[];
}