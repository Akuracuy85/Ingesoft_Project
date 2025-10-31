import HttpClient from "./Client";

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  dni: string;
  birthDate: string;
  phone: string;
}

export interface PointHistoryItem {
  date: string;
  description: string;
  points: number;
  type: "ganancia" | "gasto";
}

export interface PaymentMethod {
  type: string;
  lastFourDigits: string;
}

export interface PointsInfo {
  totalPoints: number;
  history: PointHistoryItem[];
}

class ClientUserService extends HttpClient {
  constructor() {
    super("/usuario");
  }

  async getProfile(id: string): Promise<ClientProfile> {
    const data = await this.get<ClientProfile>(`/${id}`);
    return data;
  }

  async updateProfile(id: string, payload: Partial<ClientProfile>): Promise<ClientProfile> {
    const data = await this.put<ClientProfile>(`/${id}`, payload);
    return data;
  }
  
  async getPoints(id: string): Promise<PointsInfo> {
    const data = await this.get<PointsInfo>(`/${id}/points`);
    return data;
  }

    async getPaymentMethod(id: string): Promise<PaymentMethod> {
      const data = await this.get<PaymentMethod>(`/${id}/payment`);
      return data;
  }
  

  async savePaymentMethod(id: string, payload: PaymentMethod): Promise<PaymentMethod> {
    const data = await this.put<PaymentMethod>(`/${id}/payment`, payload);
    return data;
  }
  async deletePaymentMethod(id: string): Promise<void> {
    await this.delete(`/${id}/payment`);
  }
}

export const clientUserService = new ClientUserService();
