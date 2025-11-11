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