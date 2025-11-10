import { AppDataSource } from "../database/data-source";
import {
  EventoRepository,
  IFiltrosEvento,
} from "../repositories/EventoRepository";
import { Evento } from "../models/Evento";
import { CustomError } from "../types/CustomError";
import { StatusCodes } from "http-status-codes";
import { EventoBasicoDto } from "../dto/evento/EventoBasicoDto";
import { CrearEventoDto } from "../dto/evento/CrearEventoDto";
import { EstadoEvento } from "../enums/EstadoEvento";
import { Rol } from "../enums/Rol";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { Organizador } from "../models/Organizador";
import { randomBytes } from "crypto";
import { ActualizarEventoDto } from "../dto/evento/ActualizarEventoDto";
import { Documento } from "../models/Documento";
import { DocumentoDto } from "../dto/evento/DocumentoDto";
import { ZonaDto } from "../dto/evento/ZonaDto";
import { Zona } from "../models/Zona";
import { EventoDetalleDto } from "../dto/evento/EventoDetalleDto";
import { Artista } from "../models/Artista";
import { Repository } from "typeorm";
import { TarifaDto } from "../dto/evento/TarifaDto";
import { Tarifa } from "../models/Tarifa";
import { S3Service } from "../services/S3Service";

export type FiltrosUbicacion = Record<string, Record<string, string[]>>;
export class EventoService {
  private static instance: EventoService;
  private eventoRepository: EventoRepository;
  private usuarioRepository: UsuarioRepository;
  private artistaRepository: Repository<Artista>;

  private constructor() {
    this.eventoRepository = EventoRepository.getInstance();
    this.usuarioRepository = UsuarioRepository.getInstance();
    this.artistaRepository = AppDataSource.getRepository(Artista);
  }

  public static getInstance(): EventoService {
    if (!EventoService.instance) {
      EventoService.instance = new EventoService();
    }
    return EventoService.instance;
  }

  async obtenerDatosBasicos(organizadorId: number): Promise<EventoBasicoDto[]> {
    await this.obtenerOrganizador(organizadorId);

    // Listado resumido para tableros: únicamente nombre, fecha y estado ordenados cronológicamente.
    try {
      const eventos =
        await this.eventoRepository.obtenerDatosBasicosPorOrganizador(
          organizadorId
        );
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

  async obtenerEventosDetallados(
    organizadorId: number
  ): Promise<EventoDetalleDto[]> {
    await this.obtenerOrganizador(organizadorId);

    // Trae los eventos del organizador con todas las relaciones relevantes y los adapta al contrato del API.
    try {
      const eventos =
        await this.eventoRepository.obtenerEventosDetalladosPorOrganizador(
          organizadorId
        );

      return eventos.map((evento) => ({
        id: evento.id,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        estado: evento.estado,
        fechaEvento: evento.fechaEvento.toISOString(),
        departamento: evento.departamento,
        provincia: evento.provincia,
        distrito: evento.distrito,
        lugar: evento.lugar,
        fechaPublicacion: evento.fechaPublicacion.toISOString(),
        aforoTotal: evento.aforoTotal,
        entradasVendidas: evento.entradasVendidas,
        codigoPrivado: evento.codigoPrivado,
        gananciaTotal: evento.gananciaTotal,
        artistaId: evento.artista ? evento.artista.id : null,
        imagenBanner: evento.imagenBanner
          ? evento.imagenBanner.toString("base64")
          : null,
        imagenLugar: evento.imagenLugar
          ? evento.imagenLugar.toString("base64")
          : null,
        terminosUso: evento.terminosUso
          ? this.mapearDocumentoDto(evento.terminosUso)
          : null,
        documentosRespaldo: (evento.documentosRespaldo || []).map(
          (documento) => this.mapearDocumentoDto(documento)
        ),
        zonas: (evento.zonas || []).map((zona) => this.mapearZonaDto(zona)),
      }));
    } catch (error) {
      throw new CustomError(
        "Error al obtener el detalle de los eventos",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene la lista de eventos publicados, aplicando filtros dinámicos.
   */
  async listarEventosPublicados(filtros: IFiltrosEvento): Promise<Evento[]> {
    try {
      const eventos = await this.eventoRepository.listarEventosFiltrados(
        filtros
      );

      /*if (!eventos.length) {
        throw new CustomError(
          "No se encontraron eventos que coincidan con los filtros.",
          StatusCodes.NOT_FOUND
        );
      }*/

      return eventos;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al obtener el listado de eventos",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene el detalle público de un evento por identificador.
   */
  async obtenerDetalleEvento(id: number): Promise<Evento> {
    try {
      const evento = await this.eventoRepository.buscarPorIdParaCompra(id);
      if (!evento) {
        throw new CustomError("Evento no encontrado", StatusCodes.NOT_FOUND);
      }
      return evento;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al obtener el detalle del evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  
  async crearEvento(data: CrearEventoDto, organizadorId: number) {
    this.validarDatosObligatorios(data);
    const organizador = await this.obtenerOrganizador(organizadorId);
    const artista = await this.obtenerArtistaValido(data.artistaId);
    const estado = this.obtenerEstadoValido(data.estado);
    const fechaEvento = this.combinarFechaHora(data.fecha, data.hora);
    const imagenBanner = this.convertirImagen(data.imagenPortada);

    try {
      return await this.eventoRepository.crearEvento({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion.trim(),
        fechaEvento,
        departamento: data.departamento.trim(),
        provincia: data.provincia.trim(),
        distrito: data.distrito.trim(),
        lugar: data.lugar.trim(),
        estado,
        fechaPublicacion: new Date(),
        aforoTotal: 0,
        entradasVendidas: 0,
        codigoPrivado: this.generarCodigoPrivado(),
        imagenBanner,
        gananciaTotal: 0,
        organizador,
        artista,
      });
    } catch (error) {
      throw new CustomError(
        "Error al crear el evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Crea un evento genérico (ej. flujos administrativos) aplicando valores por defecto.
   */
  async crearEventoPublico(data: Partial<Evento>): Promise<Evento> {
    try {
      const payload: Partial<Evento> = {
        ...data,
        entradasVendidas: data.entradasVendidas ?? 0,
        gananciaTotal: data.gananciaTotal ?? 0,
        estado: data.estado ?? EstadoEvento.BORRADOR,
      };
      return await this.eventoRepository.crearEvento(payload);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al crear el evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async actualizarEvento(
    eventoId: number,
    data: ActualizarEventoDto,
    organizadorId: number
  ): Promise<Evento> {
    this.validarDatosObligatorios(data);
    await this.obtenerOrganizador(organizadorId);

    // Recuperamos el evento completo para asegurar propiedad y poder sincronizar relaciones hijas.
    const evento = await this.eventoRepository.obtenerEventoDetalle(eventoId);

    if (!evento || evento.organizador.id !== organizadorId) {
      throw new CustomError("Evento no encontrado", StatusCodes.NOT_FOUND);
    }

    const estado = this.obtenerEstadoValido(data.estado);
    const fechaEvento = this.combinarFechaHora(data.fecha, data.hora);
    const artista = await this.obtenerArtistaValido(data.artistaId);

    evento.nombre = data.nombre.trim();
    evento.descripcion = data.descripcion.trim();
    evento.estado = estado;
    evento.fechaEvento = fechaEvento;
    evento.departamento = data.departamento.trim();
    evento.provincia = data.provincia.trim();
    evento.distrito = data.distrito.trim();
    evento.lugar = data.lugar.trim();
    evento.artista = artista;

    if (data.imagenPortada !== undefined) {
      evento.imagenBanner = data.imagenPortada
        ? this.convertirImagen(data.imagenPortada)
        : null;
    }

    await this.actualizarTerminosUso(evento, data.terminosUso);

    if (data.documentosRespaldo) {
      await this.sincronizarDocumentosRespaldo(
        evento,
        data.documentosRespaldo
      );
    }

    if (data.zonas) {
      await this.sincronizarZonas(evento, data.zonas);
    }

    try {
      return await this.eventoRepository.guardarEvento(evento);
    } catch (error) {
      throw new CustomError(
        "Error al actualizar el evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async obtenerOrganizador(organizadorId: number): Promise<Organizador> {
    const usuario = await this.usuarioRepository.buscarPorId(organizadorId);

    if (!usuario || usuario.rol !== Rol.ORGANIZADOR) {
      throw new CustomError(
        "No autorizado para gestionar eventos",
        StatusCodes.FORBIDDEN
      );
    }

    return usuario as Organizador;
  }

  private async obtenerArtistaValido(artistaId: number): Promise<Artista> {
    if (!Number.isInteger(artistaId) || artistaId <= 0) {
      throw new CustomError(
        "El identificador del artista no es válido",
        StatusCodes.BAD_REQUEST
      );
    }

    const artista = await this.artistaRepository.findOne({
      where: { id: artistaId },
      relations: { categoria: true },
    });

    if (!artista) {
      throw new CustomError(
        "El artista seleccionado no existe",
        StatusCodes.BAD_REQUEST
      );
    }

    return artista;
  }

  private async actualizarTerminosUso(
    evento: Evento,
    terminosDto?: DocumentoDto | null
  ) {
    if (terminosDto === undefined) {
      return;
    }

    if (!terminosDto) {
      // Null explícito significa eliminar los términos actuales.
      if (evento.terminosUso?.id) {
        await this.eliminarDocumentoEnAlmacenamiento(evento.terminosUso.url);
        await this.eventoRepository.eliminarDocumentoPorId(
          evento.terminosUso.id
        );
      }
      evento.terminosUso = null;
      return;
    }

    const carpetaS3 = `eventos/${evento.id}/terminos`;

    if (evento.terminosUso) {
      await this.prepararDocumentoParaGuardar(
        evento.terminosUso,
        terminosDto,
        carpetaS3,
        evento.terminosUso.url
      );
      await this.eventoRepository.guardarDocumento(evento.terminosUso);
      return;
    }

    const documento = new Documento();
    await this.prepararDocumentoParaGuardar(
      documento,
      terminosDto,
      carpetaS3
    );
    const documentoGuardado = await this.eventoRepository.guardarDocumento(
      documento
    );
    evento.terminosUso = documentoGuardado;
  }

  private async sincronizarDocumentosRespaldo(
    evento: Evento,
    documentosDto: DocumentoDto[]
  ) {
    const actuales = evento.documentosRespaldo ?? [];
    // Se indexa por id para detectar qué documentos se actualizan, agregan o eliminan en esta edición.
    const documentosPorId = new Map<number, Documento>(
      actuales.filter((doc) => doc.id).map((doc) => [doc.id as number, doc])
    );
    const idsRecibidos = new Set<number>();
    const nuevos: Documento[] = [];

    for (const docDto of documentosDto) {
      if (docDto.id && documentosPorId.has(docDto.id)) {
        const documento = documentosPorId.get(docDto.id)!;
        await this.prepararDocumentoParaGuardar(
          documento,
          docDto,
          `eventos/${evento.id}/documentos`,
          documento.url
        );
        documento.evento = evento;
        idsRecibidos.add(docDto.id);
      } else {
        const documento = new Documento();
        await this.prepararDocumentoParaGuardar(
          documento,
          docDto,
          `eventos/${evento.id}/documentos`
        );
        documento.evento = evento;
        nuevos.push(documento);
      }
    }

    const documentosAEliminar = actuales.filter(
      (doc) => doc.id && !idsRecibidos.has(doc.id)
    );

    const idsAEliminar = documentosAEliminar.map((doc) => doc.id as number);

    if (idsAEliminar.length) {
      await Promise.all(
        documentosAEliminar.map((doc) =>
          this.eliminarDocumentoEnAlmacenamiento(doc.url)
        )
      );
      await this.eventoRepository.eliminarDocumentosPorIds(idsAEliminar);
    }

    const documentosActualizados = actuales.filter(
      (doc) => doc.id && idsRecibidos.has(doc.id)
    );

    if (documentosActualizados.length) {
      await this.eventoRepository.guardarDocumentos(documentosActualizados);
    }

    let resultado = documentosActualizados;

    if (nuevos.length) {
      const creados = await this.eventoRepository.guardarDocumentos(nuevos);
      resultado = [...resultado, ...creados];
    }

    evento.documentosRespaldo = resultado;
  }

  private async prepararDocumentoParaGuardar(
    documento: Documento,
    dto: DocumentoDto,
    carpetaS3: string,
    urlAnterior?: string | null
  ) {
    documento.nombreArchivo = dto.nombreArchivo.trim();

    let tamano = Number(dto.tamano);
    if (!Number.isFinite(tamano) || tamano <= 0) {
      tamano = undefined;
    }

    let url = dto.url?.trim();
    let tipoDesdeCarga: string | undefined;

    if (dto.contenidoBase64) {
      const s3 = S3Service.getInstance();
      const resultado = await s3.subirBase64({
        base64: dto.contenidoBase64,
        fileName: documento.nombreArchivo,
        contentType: dto.tipo,
        prefix: carpetaS3,
      });
      url = resultado.url;
      tamano = resultado.size;
      tipoDesdeCarga = resultado.contentType;

      if (urlAnterior && urlAnterior !== url) {
        await s3.eliminarPorUrl(urlAnterior);
      }
    } else if (!url) {
      throw new CustomError(
        "El documento debe incluir una URL válida o su contenido en base64",
        StatusCodes.BAD_REQUEST
      );
    }

    const tamanoFinal = tamano ?? documento.tamano;
    if (tamanoFinal === undefined || tamanoFinal === null) {
      throw new CustomError(
        "El tamaño del documento es obligatorio",
        StatusCodes.BAD_REQUEST
      );
    }

    documento.tamano = tamanoFinal;
    documento.tipo = this.normalizarTipoDocumento(
      dto.tipo,
      tipoDesdeCarga,
      documento.tipo
    );
    documento.url = url!;
  }

  private normalizarTipoDocumento(
    ...tipos: Array<string | undefined | null>
  ): string {
    for (const tipo of tipos) {
      if (!tipo) continue;
      const limpio = tipo.trim();
      if (!limpio) continue;
      if (limpio.includes("/")) {
        return limpio;
      }
    }

    for (const tipo of tipos) {
      if (!tipo) continue;
      const limpio = tipo.trim();
      if (limpio) {
        return limpio;
      }
    }

    return "application/octet-stream";
  }

  private async eliminarDocumentoEnAlmacenamiento(
    url?: string | null
  ): Promise<void> {
    if (!url) return;
    try {
      const s3 = S3Service.getInstance();
      await s3.eliminarPorUrl(url);
    } catch (error) {
      // Se ignora cualquier error para no afectar la operación principal.
      console.warn("No se pudo eliminar el archivo en S3:", error);
    }
  }

  private async sincronizarZonas(evento: Evento, zonasDto: ZonaDto[]) {
    const actuales = evento.zonas ?? [];
    // Igual que con documentos, se indexan las zonas existentes para mantener consistencia y recalcular el aforo.
    const zonasPorId = new Map<number, Zona>(
      actuales.filter((zona) => zona.id).map((zona) => [zona.id as number, zona])
    );
    const idsRecibidos = new Set<number>();
    const nuevas: Zona[] = [];

    for (const zonaDto of zonasDto) {
      if (zonaDto.id && zonasPorId.has(zonaDto.id)) {
        const zona = zonasPorId.get(zonaDto.id)!;
        zona.nombre = zonaDto.nombre.trim();
        zona.capacidad = zonaDto.capacidad;
        if (zonaDto.cantidadComprada !== undefined) {
          zona.cantidadComprada = zonaDto.cantidadComprada;
        }
        this.actualizarTarifaZona(zona, "tarifaNormal", zonaDto.tarifaNormal);
        this.actualizarTarifaZona(zona, "tarifaPreventa", zonaDto.tarifaPreventa);
        idsRecibidos.add(zonaDto.id);
      } else {
        const zona = new Zona();
        zona.nombre = zonaDto.nombre.trim();
        zona.capacidad = zonaDto.capacidad;
        zona.cantidadComprada = zonaDto.cantidadComprada ?? 0;
        zona.evento = evento;
        this.actualizarTarifaZona(zona, "tarifaNormal", zonaDto.tarifaNormal);
        this.actualizarTarifaZona(zona, "tarifaPreventa", zonaDto.tarifaPreventa);
        nuevas.push(zona);
      }
    }

    const idsAEliminar = actuales
      .filter((zona) => zona.id && !idsRecibidos.has(zona.id))
      .map((zona) => zona.id as number);

    if (idsAEliminar.length) {
      await this.eventoRepository.eliminarZonasPorIds(idsAEliminar);
    }

    const zonasActualizadas = actuales.filter(
      (zona) => zona.id && idsRecibidos.has(zona.id)
    );

    if (zonasActualizadas.length) {
      await this.eventoRepository.guardarZonas(zonasActualizadas);
    }

    let resultado = zonasActualizadas;

    if (nuevas.length) {
      const creadas = await this.eventoRepository.guardarZonas(nuevas);
      resultado = [...resultado, ...creadas];
    }

    evento.zonas = resultado;
    // Se recalcula el aforo con las zonas vigentes, evitando datos obsoletos.
    evento.aforoTotal = resultado.reduce(
      (total, zona) => total + (zona.capacidad ?? 0),
      0
    );
  }

  private actualizarTarifaZona(
    zona: Zona,
    propiedad: "tarifaNormal" | "tarifaPreventa",
    tarifaDto?: TarifaDto | null
  ) {
    if (tarifaDto === undefined) {
      return;
    }

    if (tarifaDto === null) {
      zona[propiedad] = null;
      return;
    }

    if (!tarifaDto.nombre || tarifaDto.nombre.trim() === "") {
      throw new CustomError(
        `El nombre de ${propiedad} es obligatorio`,
        StatusCodes.BAD_REQUEST
      );
    }

    if (typeof tarifaDto.precio !== "number" || tarifaDto.precio < 0) {
      throw new CustomError(
        `El precio de ${propiedad} es inválido`,
        StatusCodes.BAD_REQUEST
      );
    }

    const fechaInicio = this.convertirFechaTarifa(
      tarifaDto.fechaInicio,
      `${propiedad}.fechaInicio`
    );
    const fechaFin = this.convertirFechaTarifa(
      tarifaDto.fechaFin,
      `${propiedad}.fechaFin`
    );

    if (fechaFin.getTime() < fechaInicio.getTime()) {
      throw new CustomError(
        `La fecha fin de ${propiedad} no puede ser menor que la fecha de inicio`,
        StatusCodes.BAD_REQUEST
      );
    }

    const tarifaExistente = zona[propiedad] as Tarifa | null | undefined;
    const tarifa = tarifaExistente ?? new Tarifa();

    if (tarifaDto.id) {
      tarifa.id = tarifaDto.id;
    }

    tarifa.nombre = tarifaDto.nombre.trim();
    tarifa.precio = tarifaDto.precio;
    tarifa.fechaInicio = fechaInicio;
    tarifa.fechaFin = fechaFin;

    zona[propiedad] = tarifa;
  }

  private mapearDocumentoDto(documento: Documento): DocumentoDto {
    return {
      id: documento.id,
      nombreArchivo: documento.nombreArchivo,
      tipo: documento.tipo,
      tamano: documento.tamano,
      url: documento.url,
    };
  }

  private mapearZonaDto(zona: Zona): ZonaDto {
    return {
      id: zona.id,
      nombre: zona.nombre,
      capacidad: zona.capacidad,
      cantidadComprada: zona.cantidadComprada,
      tarifaNormal: this.mapearTarifaDto(zona.tarifaNormal),
      tarifaPreventa: this.mapearTarifaDto(zona.tarifaPreventa),
    };
  }

  private mapearTarifaDto(tarifa?: Tarifa | null): TarifaDto | null {
    if (!tarifa) {
      return null;
    }

    return {
      id: tarifa.id,
      nombre: tarifa.nombre,
      precio: tarifa.precio,
      fechaInicio: tarifa.fechaInicio.toISOString(),
      fechaFin: tarifa.fechaFin.toISOString(),
    };
  }

  private validarDatosObligatorios(data: CrearEventoDto | ActualizarEventoDto) {
    const campos = [
      "nombre",
      "descripcion",
      "fecha",
      "hora",
      "artistaId",
      "departamento",
      "provincia",
      "distrito",
      "lugar",
      "estado",
    ];
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

  private convertirFechaTarifa(valor: string, campo: string): Date {
    if (!valor || typeof valor !== "string") {
      throw new CustomError(
        `El campo ${campo} de la tarifa es obligatorio`,
        StatusCodes.BAD_REQUEST
      );
    }

    const normalizado = valor.trim();

    if (!normalizado) {
      throw new CustomError(
        `El campo ${campo} de la tarifa es obligatorio`,
        StatusCodes.BAD_REQUEST
      );
    }

    const fecha = new Date(normalizado);

    if (Number.isNaN(fecha.getTime())) {
      throw new CustomError(
        `El campo ${campo} de la tarifa no es válido`,
        StatusCodes.BAD_REQUEST
      );
    }

    return fecha;
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

/**
   * Obtiene la entidad de Evento, INCLUYENDO las relaciones de Zonas y Artista,
   * para ser utilizada en el mapeo a DTO para la vista de compra.
   */
  async obtenerDatosParaCompra(id: number): Promise<Evento> {
    try {
      // 🚨 Usamos el método que garantiza las relaciones necesarias para el DTO
      const evento = await this.eventoRepository.buscarPorIdParaCompra(id); 

      if (!evento) {
        throw new CustomError("Evento no encontrado.", StatusCodes.NOT_FOUND);
      }
      
      // Opcional pero recomendado: Asegurar que solo devolvemos eventos publicados
      if (evento.estado !== EstadoEvento.PUBLICADO) {
         throw new CustomError("Evento no disponible para la compra.", StatusCodes.BAD_REQUEST);
      }

      return evento;

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al obtener los datos para la compra del evento.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async obtenerFiltrosUbicacion(): Promise<FiltrosUbicacion> {
    try {
      const ubicacionesPlanas = await this.eventoRepository.obtenerUbicaciones();

      // Procesar la lista plana para convertirla en un objeto anidado
      const filtrosAnidados: FiltrosUbicacion = {};

      for (const ubicacion of ubicacionesPlanas) {
        const { departamento, provincia, distrito } = ubicacion;

        // Ignorar si algún dato es nulo
        if (!departamento || !provincia || !distrito) continue;

        if (!filtrosAnidados[departamento]) {
          filtrosAnidados[departamento] = {};
        }
        if (!filtrosAnidados[departamento][provincia]) {
          filtrosAnidados[departamento][provincia] = [];
        }
        // Evitar duplicados (aunque distinct() ya ayuda)
        if (!filtrosAnidados[departamento][provincia].includes(distrito)) {
          filtrosAnidados[departamento][provincia].push(distrito);
        }
      }

      return filtrosAnidados;

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al obtener los filtros de ubicación",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const eventoService = EventoService.getInstance();
