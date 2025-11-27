import { ChildEntity, Column, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";
import { Rol } from "../enums/Rol";
import { Tarjeta } from "./Tarjeta";

@ChildEntity(Rol.CLIENTE)
  export class Cliente extends Usuario {
  @Column({ type: "int", default: 0 })
  puntos: number;

  @OneToMany(() => Tarjeta, tarjeta => tarjeta.cliente, { cascade: true, onDelete: "CASCADE" })
  tarjetas: Tarjeta[];

  constructor() {
    super();
    this.rol = Rol.CLIENTE;
  }
}