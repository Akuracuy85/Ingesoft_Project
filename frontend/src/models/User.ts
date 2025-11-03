export type Rol = "CLIENTE" | "ORGANIZADOR" | "ADMINISTRADOR";

export interface User {
  id: number;
  dni: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  celular: string;
  rol: Rol;
  activo: boolean;
}

export interface UserFormData {
  dni: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  password: string;
  celular: string;
  rol: Rol;
  activo: boolean;
}
