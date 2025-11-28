import { Buffer } from 'buffer';
import { EventListResponseDTO } from './EventListResponseDTO';
import { EventDetailsForPurchaseDTO } from './EventDetailsForPurchaseDTO';
import { Tarifa } from "../../models/Tarifa";
import { TarifaDto } from "../evento/TarifaDto";
import { bufferToBase64 } from '../../utils/ImageUtils';
import { Evento } from '@/models/Evento';

interface ArtistEntity {
  nombre: string;
  categoria?: CategoriaEntity;
}

interface BufferData {
  type: 'Buffer';
  data: number[];
}

type BinaryData = Buffer | BufferData;

interface EventEntity {
  id: number;
  nombre: string;
  descripcion: string;
  fechaEvento: Date;
  departamento: string;
  provincia: string;
  distrito: string;
  lugar: string;
  imagenBanner: string;
  imagenLugar: string;
  mimeType?: string;
  artista: ArtistEntity;
}
interface CategoriaEntity {
  id: number;
  nombre: string;
}

interface ZoneEntity {
  id: number;
  nombre: string;
  capacidad: number;
  cantidadComprada: number;
  tarifaNormal: Tarifa | null;
  tarifaPreventa: Tarifa | null;
}

interface EventEntityWithZones extends EventEntity {
  zonas: ZoneEntity[];
}

export class EventMapper {

  private static mapearTarifaDto(tarifa?: Tarifa | null): TarifaDto | null {
    if (!tarifa) {
      return null;
    }
    return {
      id: tarifa.id,
      nombre: tarifa.nombre,
      precio: tarifa.precio,
      fechaInicio: tarifa.fechaInicio ? tarifa.fechaInicio.toISOString() : null,
      fechaFin: tarifa.fechaFin ? tarifa.fechaFin.toISOString() : null,
    };
  }
  
  static toListDTO(entity: EventEntityWithZones): EventListResponseDTO {

    const eventDate = entity.fechaEvento;

    const dateString = eventDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const timeString = eventDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const place = entity.lugar;
    const zonasDto = (entity.zonas || []).map(zona => ({
      id: zona.id,
      nombre: zona.nombre,
      capacidad: zona.capacidad,
      cantidadComprada: zona.cantidadComprada,
      tarifaNormal: this.mapearTarifaDto(zona.tarifaNormal),
      tarifaPreventa: this.mapearTarifaDto(zona.tarifaPreventa)
    }));

    // Calcular el precio mínimo disponible para el evento considerando solo tarifas vigentes
    const now = new Date();

    // Considerar vigentes las tarifas que NO han terminado aún en términos de DÍA
    // (comparación por fecha: fechaFin_date >= today_date). Ignoramos la hora.
    // Si no hay fechaFin, la tarifa se considera vigente.
    const toDateOnly = (d: any): Date | null => {
      if (!d) return null;
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return null;
      // Normalizar a fecha sin hora (UTC) para comparar solo el día
      return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
    };

    const todayDateOnly = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const tarifaVigente = (tarifa: any) => {
      if (!tarifa || typeof tarifa.precio !== 'number') return false;
      const ff = toDateOnly(tarifa.fechaFin);
      if (ff) {
        return ff.getTime() >= todayDateOnly.getTime();
      }
      // Sin fechaFin, consideramos vigente (no hay indicación de expiración)
      return true;
    };

    const precios: number[] = [];
    (entity.zonas || []).forEach((zona: any) => {
      if (!zona || typeof zona !== 'object') return;

      // Preferir objetos de tarifa con información de fechas
      if (zona.tarifaNormal && tarifaVigente(zona.tarifaNormal)) {
        precios.push(zona.tarifaNormal.precio);
      } else if (typeof zona.normal === 'number') {
        // Fallback: zona provista como fila raw con 'normal' sin info temporal
        precios.push(zona.normal);
      }

      if (zona.tarifaPreventa && tarifaVigente(zona.tarifaPreventa)) {
        precios.push(zona.tarifaPreventa.precio);
      } else if (typeof zona.preventa === 'number') {
        precios.push(zona.preventa);
      }
    });

    const minPrice = precios.length ? Math.min(...precios) : undefined;

    return {
      id: entity.id,
      title: entity.nombre,
      description: entity.descripcion,
      date: dateString,
      time: timeString,
      departamento: entity.departamento,
      provincia: entity.provincia,
      distrito: entity.distrito,
      place: place,
      image: entity.imagenBanner,
      imagePlace: entity.imagenLugar,
      artistName: entity.artista.nombre,
      category: entity.artista.categoria?.nombre,
      zonas: zonasDto,
      minPrice,
    };
  }

  /**
   * @description Transforma la entidad Evento (con Zonas y Tarifas) a la estructura 
   * EventDetailsForPurchaseDTO.
   */
  static toPurchaseDTO(entity: EventEntityWithZones): EventDetailsForPurchaseDTO {

    const eventDate = entity.fechaEvento;

    // 1. Mapeo de Propiedades Base
    const dateString = eventDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeString = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    //const place = `${entity.distrito}, ${entity.provincia}`;
    const place = entity.lugar;
    const imageBase64 = entity.imagenBanner;
    const imageLugarBase64 = entity.imagenLugar;

    // 2. Mapeo de Zonas (Transformar ZoneEntity al DTO de Zona)
    const zonasDisponibles = entity.zonas.map(zona => ({
      id: zona.id,
      nombre: zona.nombre,
      capacidad: zona.capacidad,

      // ✅ Mapeamos solo las tarifas.
      tarifaNormal: zona.tarifaNormal,
      tarifaPreventa: zona.tarifaPreventa,

      cantidadComprada: zona.cantidadComprada,
    }));

    // 3. Definición de límite de entradas
    const LIMITE_COMPRA_POR_PERSONA = 10;

    return {
      id: entity.id,
      title: entity.nombre,
      description: entity.descripcion,
      date: dateString,
      time: timeString,
      place: place,
      image: imageBase64,
      imageLugar: imageLugarBase64,
      artistName: entity.artista.nombre,

      // Propiedades específicas de Compra
      zonasDisponibles: zonasDisponibles,
      limiteEntradas: LIMITE_COMPRA_POR_PERSONA,
    };
  }
}
