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
  puntos: number; // 🛑 AÑADIR ESTA LÍNEA
}

// La interfaz UserFormData probablemente no necesita 'puntos'
// ya que los puntos se calculan, no se ingresan en un formulario de datos.
export interface UserFormData {
  dni: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  celular: string;
  rol: Rol;
  password: string;
  activo: boolean;
}