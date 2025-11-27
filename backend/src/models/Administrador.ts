import { ChildEntity } from "typeorm";
import { Usuario } from "./Usuario";
import { Rol } from "../enums/Rol";

@ChildEntity(Rol.ADMINISTRADOR)
export class Administrador extends Usuario {
  
}
