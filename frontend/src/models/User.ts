export type UserRole = "Cliente" | "Organizador" | "Administrador";
export type UserStatus = "Activo" | "Inactivo";

export interface User {
  id: number;
  name: string;
  email: string;
  dni: string;
  role: UserRole;
  status: UserStatus;
  lastAccess: string;
}

export interface UserFormData {
  name: string;
  email: string;
  dni: string;
  role: UserRole;
  status: UserStatus;
}
