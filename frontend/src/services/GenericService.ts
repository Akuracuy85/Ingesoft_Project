import HttpClient from "./Client";

class GenericService extends HttpClient {
  constructor() {
    super("/generic");
  }

  async SubirTerminosYCondiciones(base64: string): Promise<string> {
    const res = await this.put("/terminos-y-condiciones", { base64 });
    return res?.data?.url;
  }
}

export default new GenericService();