import HttpClient from "./Client";

export class GenericService extends HttpClient {
  
  public static TYC_LINK = "https://unite-local-bucket.s3.us-east-1.amazonaws.com/TerminosUnite.pdf" 

  constructor() {
    super("/generic");
  }


  async SubirTerminosYCondiciones(base64: string): Promise<string> {
    const res = await this.put("/terminos-y-condiciones", { base64 });
    return res?.data?.url;
  }
}

export default new GenericService();