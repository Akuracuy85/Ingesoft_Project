import HttpClient from "./Client";

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  dni: string;
  phone: string;
}

export interface PaymentMethod {
  id?: number;
  type: string;
  lastFourDigits: string;
}

export interface PointsInfo {
  totalPoints: number;
}

class ClientUserService extends HttpClient {
  constructor() {
    super("/perfil");
  }

  async getProfile(): Promise<ClientProfile> {
    const data = await this.get<ClientProfile>("/");
    return data;
  }

  async updateProfile(payload: Partial<ClientProfile>): Promise<ClientProfile> {
    const data = await this.put<ClientProfile>("/", payload);
    return data;
  }


  async deletePaymentMethod(tarjetaId: number): Promise<void> {
    await this.delete(`/tarjeta/${tarjetaId}`);
  }

  async getPoints(): Promise<PointsInfo> {
    const data = await this.get<PointsInfo>("/puntos");
    return data;
  }
}

export const clientUserService = new ClientUserService();
