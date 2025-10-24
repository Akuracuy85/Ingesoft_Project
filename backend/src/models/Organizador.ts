import { ChildEntity, Column } from "typeorm";
import { Usuario } from "./Usuario";
import { Rol } from "../enums/Rol";

@ChildEntity()
export class Organizador extends Usuario {
  @Column({ nullable: true })
  RUC: string;

  @Column({ nullable: true })
  RazonSocial: string;

  constructor() {
    super();
    this.rol = Rol.ORGANIZADOR;
  }
}