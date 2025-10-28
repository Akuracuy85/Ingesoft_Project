import { EventoRepository } from "@/repositories/EventoRepository";
import { CustomError } from "@/types/CustomError";
import { StatusCodes } from "http-status-codes";
import { EventoBasicoDto } from "@/dto/evento/EventoBasicoDto";
import { CrearEventoDto } from "@/dto/evento/CrearEventoDto";
import { EstadoEvento } from "@/enums/EstadoEvento";
import { Rol } from "@/enums/Rol";
import { UsuarioRepository } from "@/repositories/UsuarioRepository";
import { Organizador } from "@/models/Organizador";
import { randomBytes } from "crypto";
import { ActualizarEventoDto } from "@/dto/evento/ActualizarEventoDto";
import { Documento } from "@/models/Documento";
import { DocumentoDto } from "@/dto/evento/DocumentoDto";
import { ZonaDto } from "@/dto/evento/ZonaDto";
import { Zona } from "@/models/Zona";
import { Evento } from "@/models/Evento";
import { EventoDetalleDto } from "@/dto/evento/EventoDetalleDto";

export class EventoService {
  private static instance: EventoService;
  private eventoRepository: EventoRepository;
  private usuarioRepository: UsuarioRepository;

  private constructor() {
    this.eventoRepository = EventoRepository.getInstance();
    this.usuarioRepository = UsuarioRepository.getInstance();
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

  async crearEvento(data: CrearEventoDto, organizadorId: number) {
    this.validarDatosObligatorios(data);
    const organizador = await this.obtenerOrganizador(organizadorId);
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
        organizador,
      });
    } catch (error) {
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

    evento.nombre = data.nombre.trim();
    evento.descripcion = data.descripcion.trim();
    evento.estado = estado;
    evento.fechaEvento = fechaEvento;
    evento.lugar = data.lugar.trim();

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
        await this.eventoRepository.eliminarDocumentoPorId(
          evento.terminosUso.id
        );
      }
      evento.terminosUso = null;
      return;
    }

    if (evento.terminosUso) {
      evento.terminosUso.nombreArchivo = terminosDto.nombreArchivo.trim();
      evento.terminosUso.tipo = terminosDto.tipo.trim();
      evento.terminosUso.tamano = terminosDto.tamano;
      evento.terminosUso.url = terminosDto.url.trim();
      await this.eventoRepository.guardarDocumento(evento.terminosUso);
      return;
    }

    const documento = new Documento();
    documento.nombreArchivo = terminosDto.nombreArchivo.trim();
    documento.tipo = terminosDto.tipo.trim();
    documento.tamano = terminosDto.tamano;
    documento.url = terminosDto.url.trim();
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
        documento.nombreArchivo = docDto.nombreArchivo.trim();
        documento.tipo = docDto.tipo.trim();
        documento.tamano = docDto.tamano;
        documento.url = docDto.url.trim();
        documento.evento = evento;
        idsRecibidos.add(docDto.id);
      } else {
        const documento = new Documento();
        documento.nombreArchivo = docDto.nombreArchivo.trim();
        documento.tipo = docDto.tipo.trim();
        documento.tamano = docDto.tamano;
        documento.url = docDto.url.trim();
        documento.evento = evento;
        nuevos.push(documento);
      }
    }

    const idsAEliminar = actuales
      .filter((doc) => doc.id && !idsRecibidos.has(doc.id))
      .map((doc) => doc.id as number);

    if (idsAEliminar.length) {
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
        zona.costo = zonaDto.costo;
        if (zonaDto.cantidadComprada !== undefined) {
          zona.cantidadComprada = zonaDto.cantidadComprada;
        }
        idsRecibidos.add(zonaDto.id);
      } else {
        const zona = new Zona();
        zona.nombre = zonaDto.nombre.trim();
        zona.capacidad = zonaDto.capacidad;
        zona.costo = zonaDto.costo;
        zona.cantidadComprada = zonaDto.cantidadComprada ?? 0;
        zona.evento = evento;
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
      costo: zona.costo,
      cantidadComprada: zona.cantidadComprada,
    };
  }

  private validarDatosObligatorios(data: CrearEventoDto | ActualizarEventoDto) {
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
