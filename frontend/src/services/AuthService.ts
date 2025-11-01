import HttpClient from "./Client";
// Importamos tu tipo 'User'
import { type User } from "@/models/User"; 

// --- 1. DEFINIMOS LA RESPUESTA DEL PERFIL ---
// Esto ahora coincide con la respuesta de tu PerfilController
interface ProfileResponse {
  success: boolean;
  data: User; // <-- ¡Coincide con tu backend!
  message?: string;
}

// Interfaces para las otras respuestas
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
}

interface StatusResponse {
  success: boolean;
  expiresIn?: number;
}

interface LogoutResponse {
  success: boolean;
}


export class AuthService extends HttpClient {
  // --- 2. EL CONSTRUCTOR AHORA ESTÁ VACÍO ---
  // Hacemos esto para poder llamar a diferentes rutas base
  constructor() {
    super(""); // El basePath ahora es vacío
  }

  /**
   * Inicia sesión enviando email y password al backend
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Añadimos el prefijo /auth aquí
    return await this.post<LoginResponse>("/auth/login", credentials);
  }

  /**
   * Verifica si el usuario tiene una sesión activa
   */
  async checkSession(): Promise<StatusResponse> {
    // Añadimos el prefijo /auth aquí
    return await this.get<StatusResponse>("/auth/status");
  }

  // --- 3. ¡LA FUNCIÓN CORREGIDA! ---
  /**
   * Obtiene los datos del perfil del usuario logueado
   */
  async getProfile(): Promise<User> {
    // Usamos el tipo 'ProfileResponse'
    // Y llamamos a la ruta /perfil (¡sin /auth!)
    const response = await this.get<ProfileResponse>("/perfil");
    
    // Comprobamos la clave 'data'
    if (!response.success || !response.data) {
      throw new Error("No se pudo obtener el perfil del usuario.");
    }
    
    // Devolvemos la clave 'data'
    return response.data;
  }

  /**
   * Cierra la sesión (borra cookies desde el backend)
   */
  async logout(): Promise<LogoutResponse> {
    // Añadimos el prefijo /auth aquí
    return await this.delete<LogoutResponse>("/auth/logout");
  }
}

// Exportamos una instancia única (singleton)
export default new AuthService();

