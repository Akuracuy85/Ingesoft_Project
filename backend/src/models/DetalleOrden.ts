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

  // Relación: Muchos detalles pertenecen a una orden
  @ManyToOne(() => OrdenCompra, (orden) => orden.detalles)
  orden: OrdenCompra;

  // Relación: El detalle apunta a una zona específica
  @ManyToOne(() => Zona)
  zona: Zona;

  @Column({ type: "int" })
  cantidad: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  precioUnitario: number; // Guardamos el precio al momento de la compra

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;
  
  // CAMBIO NUEVO: Almacenará los DNIs de los asistentes para esta zona.
  @Column({ type: "json", nullable: true })
  dnis: string[];
}