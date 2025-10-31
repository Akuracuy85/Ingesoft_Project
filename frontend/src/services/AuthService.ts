// src/services/AuthService.ts
import HttpClient from "./Client";

interface LoginRequest {
  email: string;
  password: string;
}

interface StatusResponse {
  success: boolean;
  expiresIn?: number;
}

export class AuthService extends HttpClient {
  constructor() {
    super("/auth"); // basePath del backend
  }

  /**
   * Inicia sesión enviando email y password al backend
   * Guarda las cookies HTTP (automáticamente gracias a withCredentials)
   */
  async login(credentials: LoginRequest): Promise<{ success: boolean }> {
    return await this.post("/login", credentials);
  }
   // Verifica si el usuario tiene una sesión activa (valida el token)

  async checkSession(): Promise<StatusResponse> {
    return await this.get("/status");
  }

  // Cierra la sesión (borra cookies desde el backend)
  async logout(): Promise<{ success: boolean }> {
    return await this.delete("/logout");
  }
}

// Exportamos una instancia única (singleton)
export default new AuthService();
