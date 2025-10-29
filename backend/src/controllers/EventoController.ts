import { Request, Response } from "express";
import { EventoService } from "@/services/EventoService";
import { HandleResponseError } from "@/utils/Errors";
import { StatusCodes } from "http-status-codes";
import { IFiltrosEvento } from "@/repositories/EventoRepository";
import { Evento } from "@/models/Evento";

import { EventMapper } from '../dto/Event/EventMapper'; // <--- Importar el Mapper

export class EventoController {
  private static instance: EventoController;
  private eventoService: EventoService;

  private constructor() {
    this.eventoService = EventoService.getInstance();
  }

  public static getInstance(): EventoController {
    if (!EventoController.instance) {
      EventoController.instance = new EventoController();
    }
    return EventoController.instance;
  }

  /**
   * Maneja la solicitud GET para listar eventos publicados (con filtros)
   */
// En tu EventoController.ts



  listarPublicados = async (req: Request, res: Response) => {
      try {
          // req.query contiene todos los filtros (ej. { departamento: 'Lima' })
          const filtros: IFiltrosEvento = req.query;

          // 1. Obtener las entidades de la base de datos (Ej: con 'nombre', 'fechaEvento', etc.)
          const entidades = await this.eventoService.listarEventosPublicados(filtros);

          // 2. APLICAR EL MAPEO A DTO: Transformar cada entidad a la estructura del frontend.
          // Aquí es donde se cambia 'nombre' a 'title' y el Buffer de imagen a Base64.
          const dtos = entidades.map(entidad => EventMapper.toListDTO(entidad)); 

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
   * Maneja la solicitud GET para obtener el detalle de un evento
   */
  obtenerPorId = async (req: Request, res: Response) => {
    try {
        const idEvento = Number(req.params.id);
        const evento = await this.eventoService.obtenerDetalleEvento(idEvento);
        res.status(StatusCodes.OK).json({
            success: true,
            evento: evento
        });
    } catch (error) {
        HandleResponseError(res, error);
    }
  }

  /**
   * Maneja la solicitud POST para crear un nuevo evento
   */
  crearEvento = async (req: Request, res: Response) => {
    try {
      const eventoData: Partial<Evento> = req.body;
      const nuevoEvento = await this.eventoService.crearEvento(eventoData);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        evento: nuevoEvento,
      });
    } catch (error) {
      HandleResponseError(res, error);
    }
  };
}

export const eventoController = EventoController.getInstance();