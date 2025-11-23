import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";

export function ObtenerEnvObligatorio(nombre: string): string {
    const valor = process.env[nombre];
    if (!valor) {
      throw new CustomError(
        `La variable de entorno ${nombre} es obligatoria para usar S3`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    return valor;
  }