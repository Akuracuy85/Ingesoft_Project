import { Request, Response } from "express";
import { EventoService } from "../services/EventoService";
import { HandleResponseError } from "../utils/Errors";
import { StatusCodes } from "http-status-codes";
import { IFiltrosEvento } from "../repositories/EventoRepository";
import { Evento } from "../models/Evento";

import { EventMapper } from '../dto/Event/EventMapper'; // <--- Importar el Mapper
import { EstadoEvento } from "../enums/EstadoEvento";
import { EmailService } from "../services/EmailService";

export class EventoController {
  private static instance: EventoController;
  private eventoService: EventoService;
  private emailService: EmailService;

  private constructor() {
    this.eventoService = EventoService.getInstance();
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): EventoController {
    if (!EventoController.instance) {
      EventoController.instance = new EventoController();
    }
    return EventoController.instance;
  }

  /**
   * Listado público de eventos publicados aplicando filtros opcionales.
   */
  // En tu EventoController.ts



  listarPublicados = async (req: Request, res: Response) => {
    try {
      // req.query contiene todos los filtros (ej. { departamento: 'Lima' })
      const filtros: IFiltrosEvento = parseFiltros(req.query);
      // 1. Obtener las entidades de la base de datos (Ej: con 'nombre', 'fechaEvento', etc.)
      const entidades = await this.eventoService.listarEventosPublicados(filtros);
      // 2. APLICAR EL MAPEO A DTO: Transformar cada entidad a la estructura del frontend.
      // Aquí es donde se cambia 'nombre' a 'title' y el Buffer de imagen a Base64.
      const dtos = entidades.map(entidad => EventMapper.toListDTO(entidad as any));
      // 3. Enviar la respuesta con los DTOs
      res.status(StatusCodes.OK).json({
        success: true,
        // Enviamos el array de DTOs mapeados
        eventos: dtos,
      });

    } catch (error) {
      // Manejo de errores centralizado
      HandleResponseError(res, error);
    }
  };

  /**
   * Devuelve el detalle público de un evento por identificador.
   */
  obtenerPorId = async (req: Request, res: Response) => {
    const eventoId = Number(req.params.id);

    if (!Number.isInteger(eventoId) || eventoId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del evento no es válido",
      });
    }

    try {
      const evento = await this.eventoService.obtenerDetalleEvento(eventoId);
      res.status(StatusCodes.OK).json({
        success: true,
        evento,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  obtenerDatosBasicos = async (req: Request, res: Response) => {
    const organizadorId = req.userId;

    if (!organizadorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      const eventos =
        await this.eventoService.obtenerDatosBasicos(organizadorId);
      res.status(StatusCodes.OK).json({
        success: true,
        eventos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  obtenerEventosDetallados = async (req: Request, res: Response) => {
    const organizadorId = req.userId;

    if (!organizadorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      const eventos = await this.eventoService.obtenerEventosDetallados(
        organizadorId
      );
      res.status(StatusCodes.OK).json({
        success: true,
        eventos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  crearEvento = async (req: Request, res: Response) => {
    const organizadorId = req.userId;

    if (!organizadorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    try {
      const evento = await this.eventoService.crearEvento(
        req.body,
        organizadorId
      );
      res.status(StatusCodes.CREATED).json({
        success: true,
        eventoId: evento.id,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  actualizarEvento = async (req: Request, res: Response) => {
    const organizadorId = req.userId;

    if (!organizadorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    const eventoId = Number(req.params.id);

    if (!Number.isInteger(eventoId) || eventoId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del evento no es válido",
      });
    }

    try {
      const evento = await this.eventoService.actualizarEvento(
        eventoId,
        req.body,
        organizadorId
      );

      if (evento.estado === EstadoEvento.CANCELADO) {
        await this.emailService.SendEventCancelledEmail(evento.id);
      }
      else {
        await this.emailService.SendUpdateEventEmail(evento.id);
      }

      res.status(StatusCodes.OK).json({
        success: true,
        eventoId: evento.id,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };

  aprobarEvento = async (req: Request, res: Response) => {
    const eventoId = Number(req.params.id);

    if (!Number.isInteger(eventoId) || eventoId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del evento no es válido",
      });
    }

    const autor = req.author;
    if (!autor) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }


    try {
      const evento = await this.eventoService.aprobarEvento(
        eventoId,
        autor
      );

      res.status(StatusCodes.OK).json({
        success: true,
        eventoId: evento.id,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }


  };

  rechazarEvento = async (req: Request, res: Response) => {
    const eventoId = Number(req.params.id);

    if (!Number.isInteger(eventoId) || eventoId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del evento no es válido",
      });
    }

    const autor = req.author;
    if (!autor) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado",
      });
    }

    const { motivo } = req.body as { motivo?: string };

    try {
      const evento = await this.eventoService.rechazarEvento(
        eventoId,
        autor,
        motivo
      );



      res.status(StatusCodes.OK).json({
        success: true,
        eventoId: evento.id,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };


  // EventoController.ts
  obtenerFiltrosUbicacion = async (req: Request, res: Response) => {
    try {
      const filtros = await this.eventoService.obtenerFiltrosUbicacion();
      res.status(StatusCodes.OK).json({
        success: true,
        data: filtros,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };
  /**
   * @description Devuelve los datos detallados de un evento necesarios para la compra (público).
   * 🚨 CORRECCIÓN CLAVE: Aplica el Mapper y devuelve SOLO el DTO.
   */
  obtenerDatosCompraPorId = async (req: Request, res: Response) => {
    const eventoId = Number(req.params.id);

    if (!Number.isInteger(eventoId) || eventoId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El identificador del evento no es válido",
      });
    }

    try {
      // 1. Obtener la entidad usando el nuevo método del servicio que carga Zonas y Artista
      const eventoEntidad = await this.eventoService.obtenerDatosParaCompra(eventoId);

      // 2.  APLICAR EL MAPEO A DTO
      // Esto transforma la entidad a la estructura del frontend (title, image:base64, artistName, etc.)
      const eventoDto = EventMapper.toPurchaseDTO(eventoEntidad as any);

      // 3.  RESPONDER DIRECTAMENTE CON EL DTO 
      // Esto elimina la envoltura { success: true, evento: ... }
      return res.status(StatusCodes.OK).json(eventoDto);

    } catch (error) {
      // Manejo de errores
      HandleResponseError(res, error);
    }
  };

  obtenerTodos = async (req: Request, res: Response) => {
    const autor = req.author;

    if (!autor) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No autorizado. Se requiere autenticación de administrador.",
      });
    }
    try {
      const eventos = await this.eventoService.obtenerTodosLosEventos();
      res.status(StatusCodes.OK).json({
        success: true,
        eventos: eventos,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };


}

function parseFiltros(query: Request['query']): IFiltrosEvento {

  /**
   * Convierte un parámetro de consulta (que puede ser '5' o ['5', '8']) 
   * en un array de números [5, 8].
   */
  const parseIds = (param: string | string[] | undefined): number[] | undefined => {
    if (!param) return undefined;

    // Aseguramos que sea un array
    const array = Array.isArray(param) ? param : [param];

    // Convertimos a número y filtramos valores inválidos (NaN)
    const numbers = array.map(id => Number(id.trim())).filter(Number.isFinite);

    return numbers.length > 0 ? numbers : undefined;
  };

  return {
    // Campos de texto
    departamento: query.departamento as string | undefined,
    provincia: query.provincia as string | undefined,
    distrito: query.distrito as string | undefined,
    fechaInicio: query.fechaInicio as string | undefined,
    fechaFin: query.fechaFin as string | undefined,

    // 🛑 Convertir a número
    precioMin: query.precioMin ? Number(query.precioMin) : undefined,
    precioMax: query.precioMax ? Number(query.precioMax) : undefined,

    // 🛑 Convertir a array de números
    artistaIds: parseIds(query.artistaIds as any),
    categoriaIds: parseIds(query.categoriaIds as any),
  };
}


export const eventoController = EventoController.getInstance();
