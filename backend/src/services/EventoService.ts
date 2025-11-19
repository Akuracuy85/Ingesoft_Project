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
import { Usuario } from "../models/Usuario";
import { randomBytes } from "crypto";
import { ActualizarEventoDto } from "../dto/evento/ActualizarEventoDto";
import { ActualizarDatosBasicosDto } from "../dto/evento/ActualizarDatosBasicosDto";
import { ActualizarPortadaDto } from "../dto/evento/ActualizarPortadaDto";
import { ActualizarImagenLugarDto } from "../dto/evento/ActualizarImagenLugarDto";
import { ActualizarDocumentosDto } from "../dto/evento/ActualizarDocumentosDto";
import { ActualizarTerminosDto } from "../dto/evento/ActualizarTerminosDto";
import { ActualizarZonasDto } from "../dto/evento/ActualizarZonasDto";
import { ActualizarEstadoDto } from "../dto/evento/ActualizarEstadoDto";
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
import { AccionRepository } from "../repositories/AccionRepository";
import { TipoAccion } from "../enums/TipoAccion";
import { ConvertirFechaUTCaPeru } from "../utils/FechaUtils";
import { bufferToBase64 } from "@/utils/ImageUtils";
import { tienePropiedad } from "@/utils/ObjectUtils";

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
        fecha: ConvertirFechaUTCaPeru(fechaEvento),
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
        fechaEvento: ConvertirFechaUTCaPeru(evento.fechaEvento).toISOString(), //Restando 5 horas para hacer match con perú
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
        fechaFinPreventa: evento.fechaFinPreventa ? evento.fechaFinPreventa.toISOString() : null,
        fechaInicioPreventa: evento.fechaInicioPreventa ? evento.fechaInicioPreventa.toISOString() : null,
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
      evento.fechaEvento = ConvertirFechaUTCaPeru(evento.fechaEvento); //Restamos 5 horas para que esté en hora de perú
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
    // Validar fechaFinPreventa si viene
    let fechaFinPreventa: Date | null = null;
    let fechaInicioPreventa: Date | null = null;
    if (data.fechaInicioPreventa) {
      const fi = new Date(data.fechaInicioPreventa + 'T00:00:00');
      if (Number.isNaN(fi.getTime())) {
        throw new CustomError("La fechaInicioPreventa no es válida", StatusCodes.BAD_REQUEST);
      }
      if (fi.getTime() > fechaEvento.getTime()) {
        throw new CustomError("La fecha inicio de preventa no puede ser mayor a la fecha del evento", StatusCodes.BAD_REQUEST);
      }
      fechaInicioPreventa = fi;
    }
    if (data.fechaFinPreventa) {
      const ff = new Date(data.fechaFinPreventa + 'T00:00:00');
      if (Number.isNaN(ff.getTime())) {
        throw new CustomError("La fechaFinPreventa no es válida", StatusCodes.BAD_REQUEST);
      }
      if (ff.getTime() > fechaEvento.getTime()) {
        throw new CustomError("La fecha fin de preventa no puede ser mayor a la fecha del evento", StatusCodes.BAD_REQUEST);
      }
      if (fechaInicioPreventa && ff.getTime() < fechaInicioPreventa.getTime()) {
        throw new CustomError("La fecha fin de preventa no puede ser menor que la fecha inicio de preventa", StatusCodes.BAD_REQUEST);
      }
      fechaFinPreventa = ff;
    }
    const imagenBanner = this.convertirImagen(data.imagenPortada);

    try {
      return await this.eventoRepository.crearEvento({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion.trim(),
        fechaEvento,
        lugar: data.lugar.trim(),
        departamento: data.departamento.trim(),
        provincia: data.provincia.trim(),
        distrito: data.distrito.trim(),
        estado,
        fechaPublicacion: new Date(),
        fechaFinPreventa, // NUEVO
        fechaInicioPreventa, // NUEVO
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
    const evento = await this.obtenerEventoPropietario(eventoId, organizadorId);
    return this.aplicarActualizacion(evento, data);
  }

  async actualizarDatosBasicos(
    eventoId: number,
    data: ActualizarDatosBasicosDto,
    organizadorId: number
  ): Promise<Evento> {
    return this.actualizarEvento(eventoId, data, organizadorId);
  }

  async actualizarPortada(
    eventoId: number,
    data: ActualizarPortadaDto,
    organizadorId: number
  ): Promise<Evento> {
    if (!tienePropiedad(data, "imagenPortada")) {
      throw new CustomError(
        "Debes enviar la imagen de portada o null para eliminarla",
        StatusCodes.BAD_REQUEST
      );
    }
    return this.actualizarEventoParcial(
      eventoId,
      { imagenPortada: data.imagenPortada ?? null },
      organizadorId
    );
  }

  async actualizarImagenLugar(
    eventoId: number,
    data: ActualizarImagenLugarDto,
    organizadorId: number
  ): Promise<Evento> {
    if (!tienePropiedad(data, "imagenLugar")) {
      throw new CustomError(
        "Debes enviar la imagen del lugar o null para eliminarla",
        StatusCodes.BAD_REQUEST
      );
    }
    return this.actualizarEventoParcial(
      eventoId,
      { imagenLugar: data.imagenLugar ?? null },
      organizadorId
    );
  }

  async actualizarDocumentosRespaldo(
    eventoId: number,
    data: ActualizarDocumentosDto,
    organizadorId: number
  ): Promise<Evento> {
    if (!tienePropiedad(data, "documentosRespaldo")) {
      throw new CustomError(
        "Debes enviar la lista completa de documentos de respaldo",
        StatusCodes.BAD_REQUEST
      );
    }
    return this.actualizarEventoParcial(
      eventoId,
      { documentosRespaldo: data.documentosRespaldo },
      organizadorId
    );
  }

  async actualizarTerminosEvento(
    eventoId: number,
    data: ActualizarTerminosDto,
    organizadorId: number
  ): Promise<Evento> {
    if (!tienePropiedad(data, "terminosUso")) {
      throw new CustomError(
        "Debes enviar los términos de uso (o null para eliminarlos)",
        StatusCodes.BAD_REQUEST
      );
    }
    return this.actualizarEventoParcial(
      eventoId,
      { terminosUso: data.terminosUso },
      organizadorId
    );
  }

  async actualizarZonas(
    eventoId: number,
    data: ActualizarZonasDto,
    organizadorId: number
  ): Promise<Evento> {
    if (!tienePropiedad(data, "zonas")) {
      throw new CustomError(
        "Debes enviar el arreglo de zonas a actualizar",
        StatusCodes.BAD_REQUEST
      );
    }
    return this.actualizarEventoParcial(
      eventoId,
      { zonas: data.zonas },
      organizadorId
    );
  }

  async actualizarEstadoOrganizador(
    eventoId: number,
    data: ActualizarEstadoDto,
    organizadorId: number
  ): Promise<Evento> {
    if (!tienePropiedad(data, "estado")) {
      throw new CustomError(
        "Debes indicar el nuevo estado del evento",
        StatusCodes.BAD_REQUEST
      );
    }
    return this.actualizarEventoParcial(
      eventoId,
      { estado: data.estado },
      organizadorId
    );
  }

  private async actualizarEventoParcial(
    eventoId: number,
    parcial: Partial<ActualizarEventoDto>,
    organizadorId: number
  ): Promise<Evento> {
    const evento = await this.obtenerEventoPropietario(eventoId, organizadorId);
    const dto = this.completarCamposObligatorios(evento, parcial);
    return this.aplicarActualizacion(evento, dto);
  }

  private async obtenerEventoPropietario(
    eventoId: number,
    organizadorId: number
  ): Promise<Evento> {
    await this.obtenerOrganizador(organizadorId);
    const evento = await this.eventoRepository.obtenerEventoDetalle(eventoId);

    if (!evento) {
      throw new CustomError("Evento no encontrado", StatusCodes.NOT_FOUND);
    }
    if (evento.organizador.id !== organizadorId) {
      throw new CustomError(
        "No autorizado para gestionar este evento",
        StatusCodes.FORBIDDEN
      );
    }

    return evento;
  }

  private async aplicarActualizacion(
    evento: Evento,
    data: ActualizarEventoDto
  ): Promise<Evento> {
    this.validarDatosObligatorios(data);

    const estado = this.obtenerEstadoValido(data.estado);
    const fechaEvento = this.combinarFechaHora(data.fecha, data.hora);
    // Obtener artista (faltaba y causaba ReferenceError)
    const artista = await this.obtenerArtistaValido(data.artistaId);
    // Validar y asignar fechaInicioPreventa/fechaFinPreventa
    if (data.fechaInicioPreventa !== undefined) {
      if (!data.fechaInicioPreventa) {
        evento.fechaInicioPreventa = null;
      } else {
        const fi = new Date(data.fechaInicioPreventa + 'T00:00:00');
        if (Number.isNaN(fi.getTime())) {
          throw new CustomError("La fecha inicio de preventa no es válida", StatusCodes.BAD_REQUEST);
        }
        if (fi.getTime() > fechaEvento.getTime()) {
          throw new CustomError("La fecha inicio de preventa no puede superar la fecha del evento", StatusCodes.BAD_REQUEST);
        }
        evento.fechaInicioPreventa = fi;
      }
    }
    if (data.fechaFinPreventa !== undefined) {
      if (!data.fechaFinPreventa) {
        evento.fechaFinPreventa = null;
      } else {
        const ff = new Date(data.fechaFinPreventa + 'T00:00:00');
        if (Number.isNaN(ff.getTime())) {
          throw new CustomError("La fecha fin de preventa no es válida", StatusCodes.BAD_REQUEST);
        }
        if (ff.getTime() > fechaEvento.getTime()) {
          throw new CustomError("La fecha fin de preventa no puede superar la fecha del evento", StatusCodes.BAD_REQUEST);
        }
        if (evento.fechaInicioPreventa && ff.getTime() < evento.fechaInicioPreventa.getTime()) {
          throw new CustomError("La fecha fin de preventa no puede ser menor que la fecha inicio de preventa", StatusCodes.BAD_REQUEST);
        }
        evento.fechaFinPreventa = ff;
      }
    }

    evento.nombre = data.nombre.trim();
    evento.descripcion = data.descripcion.trim();
    evento.estado = estado;
    evento.fechaEvento = fechaEvento;
    evento.lugar = data.lugar.trim();
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

    if (data.imagenLugar !== undefined) {
      evento.imagenLugar = data.imagenLugar
        ? this.convertirImagen(data.imagenLugar)
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

  private completarCamposObligatorios(
    evento: Evento,
    parcial: Partial<ActualizarEventoDto>
  ): ActualizarEventoDto {
    const artistaIdActual = evento.artista?.id;
    if (!artistaIdActual) {
      throw new CustomError(
        "El evento no tiene un artista asignado",
        StatusCodes.BAD_REQUEST
      );
    }

    const { fecha, hora } = this.obtenerFechaYHoraDesdeEvento(evento);

    return {
      nombre: parcial.nombre ?? evento.nombre,
      descripcion: parcial.descripcion ?? evento.descripcion,
      fecha: parcial.fecha ?? fecha,
      hora: parcial.hora ?? hora,
      artistaId: parcial.artistaId ?? artistaIdActual,
      lugar: parcial.lugar ?? evento.lugar,
      departamento: parcial.departamento ?? evento.departamento,
      provincia: parcial.provincia ?? evento.provincia,
      distrito: parcial.distrito ?? evento.distrito,
      estado: parcial.estado ?? evento.estado,
      imagenPortada: parcial.imagenPortada,
      imagenLugar: parcial.imagenLugar,
      terminosUso: parcial.terminosUso,
      documentosRespaldo: parcial.documentosRespaldo,
      zonas: parcial.zonas,
    };
  }

  private obtenerFechaYHoraDesdeEvento(evento: Evento): {
    fecha: string;
    hora: string;
  } {
    const fechaEvento = evento.fechaEvento;
    if (!fechaEvento) {
      throw new CustomError(
        "El evento no tiene una fecha registrada",
        StatusCodes.BAD_REQUEST
      );
    }
    const iso = fechaEvento.toISOString();
    return {
      fecha: iso.slice(0, 10),
      hora: iso.slice(11, 16),
    };
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
    if (terminosDto) {
      this.validarTerminosPdf(terminosDto);
    }
    if (!terminosDto) {
      if (evento.terminosUso?.id) {
        await this.eliminarDocumentoEnAlmacenamiento(evento.terminosUso.url);
        await this.eventoRepository.eliminarDocumentoPorId(evento.terminosUso.id);
      }
      evento.terminosUso = null;
      return;
    }
    const carpetaS3 = `eventos/${evento.id}/terminos`;
    if (evento.terminosUso) {
      // Mantener tipo lógico
      evento.terminosUso.tipo = "terminos de uso";
      await this.prepararDocumentoParaGuardar(
        evento.terminosUso,
        terminosDto,
        carpetaS3,
        evento.terminosUso.url,
        true
      );
      evento.terminosUso.evento = evento;
      await this.eventoRepository.guardarDocumento(evento.terminosUso);
      return;
    }
    const documento = new Documento();
    documento.tipo = "terminos de uso";
    documento.evento = evento;
    await this.prepararDocumentoParaGuardar(
      documento,
      terminosDto,
      carpetaS3,
      null,
      true
    );
    const documentoGuardado = await this.eventoRepository.guardarDocumento(documento);
    evento.terminosUso = documentoGuardado;
  }

  private validarTerminosPdf(dto: DocumentoDto) {
    // Solo validar si viene contenido para subir o se pretende crear/reemplazar
    const nombre = dto.nombreArchivo?.trim().toLowerCase();
    const tipo = dto.tipo?.trim().toLowerCase();
    const tamano = Number(dto.tamano);

    // Tamaño máximo 10MB
    const MAX_BYTES = 10 * 1024 * 1024; // 10 MiB
    if (Number.isFinite(tamano) && tamano > MAX_BYTES) {
      throw new CustomError(
        "El archivo de términos excede el tamaño máximo de 10MB",
        StatusCodes.BAD_REQUEST
      );
    }

    // Validación de tipo y extensión PDF
    const esPdfPorMime = tipo === "application/pdf";
    const esPdfPorNombre = nombre?.endsWith(".pdf");
    if (!esPdfPorMime && !esPdfPorNombre) {
      throw new CustomError(
        "Solo se permite subir documentos PDF como términos de uso",
        StatusCodes.BAD_REQUEST
      );
    }

    // Si no hay contenido base64 y tampoco URL, se rechazará luego en prepararDocumentoParaGuardar
    // Aquí no se hace más validación de contenido.
  }

  private async sincronizarDocumentosRespaldo(
    evento: Evento,
    documentosDto: DocumentoDto[]
  ) {
    const actuales = evento.documentosRespaldo ?? [];
    const documentosPorId = new Map<number, Documento>(
      actuales.filter((doc) => doc.id).map((doc) => [doc.id as number, doc])
    );
    const idsRecibidos = new Set<number>();
    const nuevos: Documento[] = [];
    for (const docDto of documentosDto) {
      if (docDto.id && documentosPorId.has(docDto.id)) {
        const documento = documentosPorId.get(docDto.id)!;
        documento.tipo = "documento de respaldo";
        await this.prepararDocumentoParaGuardar(
          documento,
          docDto,
          `eventos/${evento.id}/documentos`,
          documento.url,
          false
        );
        documento.evento = evento;
        idsRecibidos.add(docDto.id);
      } else {
        const documento = new Documento();
        documento.tipo = "documento de respaldo";
        await this.prepararDocumentoParaGuardar(
          documento,
          docDto,
          `eventos/${evento.id}/documentos`,
          null,
          false
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
    urlAnterior?: string | null,
    esTerminos?: boolean
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
    // Guardar MIME en contentType separado
    const mime = this.normalizarTipoDocumento(dto.tipo, tipoDesdeCarga, documento.contentType);
    documento.contentType = mime;
    // No sobrescribir tipo lógico si ya está asignado
    if (!documento.tipo || (!esTerminos && documento.tipo === "terminos de uso")) {
      // Si viene de respaldo y no tiene tipo lógico
      if (!esTerminos && documento.tipo !== "terminos de uso") {
        documento.tipo = documento.tipo || "documento de respaldo";
      }
    }
    documento.url = url!;
  }

  private mapearDocumentoDto(documento: Documento): DocumentoDto {
    return {
      id: documento.id,
      nombreArchivo: documento.nombreArchivo,
      tipo: documento.tipo,
      tamano: documento.tamano,
      url: documento.url,
      eventoId: documento.evento?.id,
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
      "lugar",
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
  /**
   * Aprueba un evento. Solo un administrador puede ejecutar esta acción.
   */
  async aprobarEvento(eventoId: number, autor: Usuario): Promise<Evento> {
    // El middleware de autorización debe garantizar que 'autor' tenga rol ADMINISTRADOR
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new CustomError("Evento no encontrado", StatusCodes.NOT_FOUND);
    }

    if (evento.estado !== EstadoEvento.PENDIENTE_APROBACION) {
      throw new CustomError(
        "Solo se pueden aprobar eventos en estado PENDIENTE_APROBACION",
        StatusCodes.BAD_REQUEST
      );
    }

    evento.estado = EstadoEvento.PUBLICADO;
    evento.fechaPublicacion = new Date();

    try {
      const guardado = await this.eventoRepository.guardarEvento(evento);
      // Registrar la acción
      const accionRepo = AccionRepository.getInstance();
      await accionRepo.crearAccion({
        fechaHora: new Date(),
        descripcion: `Evento ${evento.nombre} aprobado`,
        tipo: TipoAccion.AprobarEvento,
        autor,
      });
      return guardado;
    } catch (error) {
      throw new CustomError(
        "Error al aprobar el evento",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Rechaza o cancela un evento. Solo un administrador puede ejecutar esta acción.
   */
  async rechazarEvento(eventoId: number, autor: Usuario, motivo?: string): Promise<Evento> {
    // El middleware de autorización debe garantizar que 'autor' tenga rol ADMINISTRADOR
    const evento = await this.eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new CustomError("Evento no encontrado", StatusCodes.NOT_FOUND);
    }

    if (evento.estado !== EstadoEvento.PENDIENTE_APROBACION) {
      throw new CustomError(
        "Solo se pueden rechazar eventos en estado PENDIENTE_APROBACION",
        StatusCodes.BAD_REQUEST
      );
    }

    evento.estado = EstadoEvento.CANCELADO;

    try {
      const guardado = await this.eventoRepository.guardarEvento(evento);
      const accionRepo = AccionRepository.getInstance();
      await accionRepo.crearAccion({
        fechaHora: new Date(),
        descripcion: `Evento ${evento.nombre} rechazado${motivo ? `: ${motivo}` : ''}`,
        tipo: TipoAccion.CancelarEvento,
        autor,
      });
      return guardado;
    } catch (error) {
      throw new CustomError(
        "Error al rechazar el evento",
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

  async obtenerEmailDeAsistentesAlEvento(eventoId: number): Promise<string[]> {
    try {
      const emails = await this.eventoRepository.obtenerEmailDeAsistentesAlEvento(eventoId);
      return emails;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al obtener los emails de los asistentes al evento: " + error.message,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async obtenerTodosLosEventos(): Promise<Evento[]> {
    try {
      const eventos = await this.eventoRepository.obtenerTodosLosEventos();
      return eventos;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        "Error al obtener todos los eventos",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
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
}

export const eventoService = EventoService.getInstance();

