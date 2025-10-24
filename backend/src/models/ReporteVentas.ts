import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ReporteVentas {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "decimal", precision: 10, scale: 2 })
  ingreso: number;
  @Column({ type: "int" })
  entradasVendidas: number;
}