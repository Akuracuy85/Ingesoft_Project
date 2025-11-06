import { ChildEntity } from "typeorm";
import { Usuario } from "./Usuario";
import { Rol } from "../enums/Rol";

@ChildEntity('administrador')
export class Administrador extends Usuario {
  constructor() {
    super();
    this.rol = Rol.ADMINISTRADOR;
  }
}
