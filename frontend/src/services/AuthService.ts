import HttpClient from "./Client";
import axios from 'axios'; // 🛑 NECESARIO: Importar axios para la verificación de errores (axios.isAxiosError)

import { type User } from "@/models/User"; 

// =============================
// INTERFACES DE RESPUESTA
// =============================

interface ProfileResponse {
  success: boolean;
  data: User; 
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
}

export interface StatusResponse {
  success: boolean;
  expiresIn?: number;
}

interface LogoutResponse {
  success: boolean;
}

// =============================
// CLASE DE SERVICIO
// =============================

export class AuthService extends HttpClient {

  constructor() {
    super(""); 
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await this.post<LoginResponse>("/auth/login", credentials);
  }

  async checkSession(): Promise<StatusResponse> {
    try {
        // Intenta obtener el estado de la sesión
        return await this.get<StatusResponse>("/auth/status");
        
    } catch (error) {
        // 🛑 MANEJO CRÍTICO DEL 401
        // Si el error es de Axios y el código de estado es 401,
        // esto significa que la sesión no es válida, lo cual es el resultado esperado
        // para un usuario deslogueado.
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            
            // Devuelve una respuesta limpia que indica "no hay sesión".
            return { 
                success: false, 
                expiresIn: 0 
            };
        }

        // Para cualquier otro error (red, 500), lanza el error para que useAuth lo maneje
        throw error;
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.get<ProfileResponse>("/perfil");
    
    if (!response.success || !response.data) {
      throw new Error("No se pudo obtener el perfil del usuario.");
    }
    
    return response.data;
  }

  async logout(): Promise<LogoutResponse> {
    return await this.delete<LogoutResponse>("/auth/logout");
  }
}

export default new AuthService();