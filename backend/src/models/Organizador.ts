import { ChildEntity, Column, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";
import { Rol } from "../enums/Rol";
import { Evento } from "./Evento";

@ChildEntity(Rol.ORGANIZADOR)
export class Organizador extends Usuario {
  @Column({ nullable: true })
  RUC: string;

  @Column({ nullable: true })
  RazonSocial: string;
  @OneToMany(() => Evento, (evento) => evento.organizador)
  eventos: Evento[];

  constructor() {
    super();
    this.rol = Rol.ORGANIZADOR;
  }
}