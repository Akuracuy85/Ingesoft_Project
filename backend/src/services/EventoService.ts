import { EventoRepository } from "@/repositories/EventoRepository";
import { CustomError } from "@/types/CustomError";
import { StatusCodes } from "http-status-codes";
import { EventoBasicoDto } from "@/dto/evento/EventoBasicoDto";
import { CrearEventoDto } from "@/dto/evento/CrearEventoDto";
import { EstadoEvento } from "@/enums/EstadoEvento";
import { randomBytes } from "crypto";

export class EventoService {
  private static instance: EventoService;
  private eventoRepository: EventoRepository;

  private constructor() {
    this.eventoRepository = EventoRepository.getInstance();
  }

  public static getInstance(): EventoService {
    if (!EventoService.instance) {
      EventoService.instance = new EventoService();
    }
    return EventoService.instance;
  }

  async obtenerDatosBasicos(): Promise<EventoBasicoDto[]> {
    try {
      const eventos = await this.eventoRepository.obtenerDatosBasicos();
      return eventos.map(({ nombre, fechaEvento, estado }) => ({
        nombre,
        fecha: fechaEvento,
        estado,
      }));
    } catch (error) {
      throw new CustomError(
        "Error al obtener los datos basicos de los eventos",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async crearEvento(data: CrearEventoDto) {
    this.validarDatosObligatorios(data);
    const estado = this.obtenerEstadoValido(data.estado);
    const fechaEvento = this.combinarFechaHora(data.fecha, data.hora);
    const imagenBanner = this.convertirImagen(data.imagenPortada);

    try {
      return await this.eventoRepository.crearEvento({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion.trim(),
        fechaEvento,
        lugar: data.lugar.trim(),
        estado,
        fechaPublicacion: new Date(),
        aforoTotal: 0,
        entradasVendidas: 0,
        codigoPrivado: this.generarCodigoPrivado(),
        imagenBanner,
        gananciaTotal: 0,
      });
    } catch (error) {
      throw new CustomError(
        "Error al crear el evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  private validarDatosObligatorios(data: CrearEventoDto) {
    const campos = ["nombre", "descripcion", "fecha", "hora", "lugar", "estado"];
    for (const campo of campos) {
      if (!(data as any)[campo] || String((data as any)[campo]).trim() === "") {
        throw new CustomError(
          `El campo ${campo} es obligatorio`,
          StatusCodes.BAD_REQUEST
        );
      }
    }
  }

  private obtenerEstadoValido(valor: unknown): EstadoEvento {
    if (
      typeof valor !== "string" ||
      !Object.values(EstadoEvento).includes(valor as EstadoEvento)
    ) {
      throw new CustomError(
        "Estado del evento invalido",
        StatusCodes.BAD_REQUEST
      );
    }
    return valor as EstadoEvento;
  }

  private combinarFechaHora(fecha: string, hora: string): Date {
    const fechaNormalizada = `${fecha}T${hora}`;
    const fechaEvento = new Date(fechaNormalizada);
    if (Number.isNaN(fechaEvento.getTime())) {
      throw new CustomError(
        "La fecha u hora del evento no es valida",
        StatusCodes.BAD_REQUEST
      );
    }
    return fechaEvento;
  }

  private convertirImagen(imagen?: string): Buffer | null {
    if (!imagen) return null;
    try {
      return Buffer.from(imagen, "base64");
    } catch {
      throw new CustomError(
        "La imagen de portada no tiene un formato base64 valido",
        StatusCodes.BAD_REQUEST
      );
    }
  }

  private generarCodigoPrivado(): string {
    return randomBytes(4).toString("hex").toUpperCase();
  }
}
