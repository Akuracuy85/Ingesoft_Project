import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../types/CustomError";
import { ObtenerEnvObligatorio } from "../utils/EnvUtils";

interface UploadOptions {
  base64: string;
  fileName: string;
  contentType?: string;
  prefix?: string;
  inline?: boolean;
}

interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

export class S3Service {
  private static instance: S3Service;
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicUrlBase?: string;
  private readonly defaultPrefix: string;
  private readonly enablePublicRead: boolean;

  private constructor() {
    this.bucket = ObtenerEnvObligatorio("AWS_S3_BUCKET");
    this.region = ObtenerEnvObligatorio("AWS_REGION");
    this.publicUrlBase = process.env.AWS_S3_PUBLIC_URL?.replace(/\/+$/, "");
    this.defaultPrefix = process.env.AWS_S3_PREFIX?.replace(/^\/+|\/+$/g, "") ?? "";
    this.enablePublicRead = process.env.AWS_S3_PUBLIC_READ === "true";

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const sessionToken = process.env.AWS_SESSION_TOKEN;

    const credentials =
      accessKeyId && secretAccessKey
        ? {
          accessKeyId,
          secretAccessKey,
          sessionToken: sessionToken || undefined,
        }
        : undefined;

    this.client = new S3Client({
      region: this.region,
      credentials,
    });
  }

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  public async subirBase64(options: UploadOptions): Promise<UploadResult> {
    const { buffer, contentType: detectedType } = this.convertirBase64(
      options.base64
    );
    const contentType = this.obtenerTipoContenido(
      options.contentType,
      detectedType
    );
    const key = this.construirKey(options.fileName, options.prefix);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ContentDisposition: options.inline ? "inline" : undefined,
          ACL: this.enablePublicRead ? "public-read" : undefined,
        })
      );
    } catch (error) {
      throw new CustomError(
        "No se pudo guardar el archivo en el almacenamiento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return {
      url: this.construirUrlPublica(key),
      key,
      size: buffer.byteLength,
      contentType,
    };
  }

  async uploadFile(
    fileBuffer: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.client.send(command);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async uploadBase64Image(
    base64String: string,
    key: string
  ): Promise<string> {
    // Extrae el contenido Base64 puro, eliminando el prefijo (ej. "data:image/jpeg;base64,")
    const base64Data = base64String.split(',')[1] || base64String;
    const buffer = Buffer.from(base64Data, "base64");

    // Usamos un tipo de contenido genérico para imágenes. S3 lo manejará adecuadamente.
    const contentType = "image/jpeg";

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentEncoding: "base64",
    });

    await this.client.send(command);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFileByUrl(fileUrl: string): Promise<void> {
    if (!fileUrl) {
      return;
    }

    try {
      const url = new URL(fileUrl);
      const key = decodeURIComponent(url.pathname.substring(1));

      if (!key) {
        console.warn(`No se pudo extraer la key de la URL para eliminar: ${fileUrl}`);
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error(`Falló la eliminación del archivo en S3 con URL ${fileUrl}:`, error);
    }
  }

  public async eliminarPorUrl(url?: string | null): Promise<void> {
    if (!url) return;

    const key = this.extraerKey(url);

    if (!key) return;

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch {
      // Se ignoran los errores de eliminación para no bloquear el flujo principal.
    }
  }

  private convertirBase64(base64: string): {
    buffer: Buffer;
    contentType?: string;
  } {
    if (!base64) {
      throw new CustomError(
        "El archivo a guardar está vacío",
        StatusCodes.BAD_REQUEST
      );
    }

    let contenido = base64.trim();
    let contentType: string | undefined;

    const seccionDataUrl = /^data:(.+);base64,(.*)$/;
    const coincidencia = contenido.match(seccionDataUrl);

    if (coincidencia) {
      contentType = coincidencia[1];
      contenido = coincidencia[2];
    }

    try {
      return { buffer: Buffer.from(contenido, "base64"), contentType };
    } catch {
      throw new CustomError(
        "El archivo cargado no tiene un formato base64 válido",
        StatusCodes.BAD_REQUEST
      );
    }
  }

  private obtenerTipoContenido(
    proporcionado?: string,
    detectado?: string
  ): string {
    if (proporcionado && proporcionado.includes("/")) {
      return proporcionado.trim();
    }
    if (detectado && detectado.includes("/")) {
      return detectado.trim();
    }
    if (proporcionado) {
      return proporcionado.trim();
    }
    if (detectado) {
      return detectado.trim();
    }
    return "application/octet-stream";
  }

  private construirKey(nombreArchivo: string, prefix?: string): string {
    if (nombreArchivo.toLowerCase() === "terminosunite.pdf") {
      return "TerminosUnite.pdf";
    }

    const nombreNormalizado = this.normalizarNombre(nombreArchivo);
    const uuid = randomUUID();
    const partes = [
      this.defaultPrefix,
      prefix?.replace(/^\/+|\/+$/g, ""),
      `${uuid}-${nombreNormalizado}`,
    ].filter((parte) => parte && parte.length > 0);

    return partes.join("/");
  }

  private normalizarNombre(nombre: string): string {
    const normalizado = nombre.trim().toLowerCase();
    const sinCarpeta = normalizado.split("/").pop() ?? normalizado;
    return sinCarpeta.replace(/[^a-z0-9.\-]+/g, "-");
  }

  public construirUrlPublica(key: string): string {
    if (this.publicUrlBase) {
      return `${this.publicUrlBase}/${key}`;
    }
    if (this.region === "us-east-1") {
      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private extraerKey(url: string): string | null {
    const limpio = url.trim();

    if (!limpio) return null;

    if (this.publicUrlBase && limpio.startsWith(this.publicUrlBase)) {
      return limpio.slice(this.publicUrlBase.length + 1);
    }

    const patronAws = /^https?:\/\/[^/]+\/(.+)$/;
    const coincidencia = limpio.match(patronAws);
    if (coincidencia) {
      return coincidencia[1];
    }

    // Si no es una URL, se asume que ya es el key.
    return limpio;
  }

}
