export interface UsuarioAccion {
  id: number;
  nombre: string;
  apellido: string;
  rol: string;
  email: string;
}

export interface Accion {
  id: number;
  fechaHora: string;
  descripcion: string;
  tipo: string;
  autor: UsuarioAccion;
}

// Respuesta del backend
export interface AccionResponse {
  success: boolean;
  acciones: Accion[];
  count: number;
  message: string;
}
