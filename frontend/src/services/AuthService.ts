import HttpClient from "./Client";

import { type User } from "@/models/User"; 


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

interface StatusResponse {
  success: boolean;
  expiresIn?: number;
}

interface LogoutResponse {
  success: boolean;
}


export class AuthService extends HttpClient {

  constructor() {
    super(""); 
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {

    return await this.post<LoginResponse>("/auth/login", credentials);
  }

  async checkSession(): Promise<StatusResponse> {

    return await this.get<StatusResponse>("/auth/status");
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

