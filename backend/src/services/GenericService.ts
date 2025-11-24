import { CustomError } from "../types/CustomError";
import { S3Service } from "./S3Service";
import { StatusCodes } from "http-status-codes";

export class GenericService {
  private static instance: GenericService;
  private S3Service: S3Service;

  private constructor() {
    this.S3Service = S3Service.getInstance();
  }

  public static getInstance(): GenericService {
    if (!GenericService.instance) {
      GenericService.instance = new GenericService();
    }
    return GenericService.instance;
  }

  public async SubirTerminosYCondiciones(base64: string): Promise<string> {
    const fileName = "TerminosUnite.pdf";

    try {
      await this.EliminarTerminosYCondiciones();
      const result = await this.S3Service.subirBase64({
        base64,
        fileName,
        prefix: "",
        inline: true,
        contentType: "application/pdf"
      });

      return result.url;
    } catch (error) {
      throw new CustomError(
        "Error al subir los términos y condiciones",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async EliminarTerminosYCondiciones(): Promise<void> {
    const s3Service = S3Service.getInstance();
    const fileUrl = s3Service.construirUrlPublica("TerminosUnite.pdf");

    try {
      await s3Service.eliminarPorUrl(fileUrl);
    } catch (error) {
      throw new CustomError(
        "Error al eliminar los términos y condiciones",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}