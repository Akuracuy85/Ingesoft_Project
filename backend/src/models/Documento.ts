import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Evento } from "./Evento";

@Entity()
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nombreArchivo: string;
  @Column()
  tipo: string;
  @Column({ type: "int" })
  tamano: number;
  @Column()
  url: string;
  // Puede representar el documento de términos o cualquiera de respaldo asociado a un evento.
  @ManyToOne(() => Evento, (evento) => evento.documentosRespaldo, {
    nullable: true,
    onDelete: "CASCADE",
  })
  evento?: Evento;
  @Column({ nullable: true })
  contentType?: string;
}
