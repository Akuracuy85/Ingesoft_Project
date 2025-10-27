// CAMBIO: [2025-10-26] - Corregidos tipos de columna
// Se especifican los tipos 'int' y 'decimal' para 'cantidadComprada' y 'costo'
// para prevenir errores 'NaN' durante los cálculos.
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Evento } from "./Evento";

@Entity()
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: "int" })
  capacidad: number;

  // --- INICIO DE LA CORRECCIÓN ---
  @Column({ type: "int", default: 0 }) // <-- CORREGIDO
  cantidadComprada: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 }) // <-- CORREGIDO
  costo: number;
  // --- FIN DE LA CORRECCIÓN ---

  @ManyToOne(() => Evento, (evento) => evento.zonas)
  evento: Evento;
}