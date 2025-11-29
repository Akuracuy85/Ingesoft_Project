import React, { useState, useEffect, useCallback } from "react";
import { MapPin, ImageOff, Upload, Plus, Trash2, Save } from "lucide-react";
import type { Zone } from "@/models/Zone";
import type { Tarifa } from "@/models/Tarifa";
import { actualizarEvento, obtenerEventosDetallados, mapEstadoUIToBackend } from "@/services/EventoService";
import EventoService from "@/services/EventoService";
import NotificationService from "@/services/NotificationService";

interface ZonaBackendRaw {
  id: number;
  nombre: string;
  capacidad: number;
  cantidadComprada: number;
  tarifaNormal?: Tarifa;
  tarifaPreventa?: Tarifa | null;
}
interface ActualizarEventoResponse { success?: boolean; eventoId?: number; }
interface EventoDetalleZonasRaw { zonas?: ZonaBackendRaw[] }
interface EventoDetalladoMin {
  title: string; description: string; date: string; time?: string; artist?: { id: number }; departamento?: string; provincia?: string; distrito?: string; place?: string; imageLugar?: string; imagenLugar?: string; zonas?: ZonaBackendRaw[]; fechaFinPreventa?: string; fechaInicioPreventa?: string;
}

interface ZonasYTarifasCardProps { eventoId: number; eventoEstadoUI: string; eventoNombre: string; }

const ZonasYTarifasCard: React.FC<ZonasYTarifasCardProps> = ({ eventoId, eventoEstadoUI, eventoNombre }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLugarBase64, setImageLugarBase64] = useState<string | null>(null);
  const [fechaFinPreventa, setFechaFinPreventa] = useState<string>("");
  const [fechaInicioPreventa, setFechaInicioPreventa] = useState<string>("");

  const buildTarifaNombre = useCallback((actual?: string, tipo?: 'Normal' | 'Preventa') => {
    if (!tipo) return actual || '';
    if (actual && !/^tarifa\s*(normal|preventa)$/i.test(actual.trim())) return actual.trim();
    return `${eventoNombre} - ${tipo}`;
  }, [eventoNombre]);

  useEffect(() => {
    if (!eventoId) return;
    let abort = false;
    const fetchZonas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await EventoService.obtenerPorId(eventoId) as EventoDetalladoMin;
        const zonasRaw = (data.zonas as ZonaBackendRaw[] | undefined) || [];
        const imgLugar = data.imageLugar || data.imagenLugar || null;
        setImageLugarBase64(imgLugar || null);
        const mapped: Zone[] = zonasRaw.map((z) => {
          const normalNombre = buildTarifaNombre(z.tarifaNormal?.nombre, 'Normal');
          const preventaNombre = buildTarifaNombre(z.tarifaPreventa?.nombre, 'Preventa');
          return {
            id: z.id,
            nombre: z.nombre,
            capacidad: z.capacidad,
            cantidadComprada: z.cantidadComprada,
            tarifaNormal: z.tarifaNormal ? { ...z.tarifaNormal, nombre: normalNombre } : { nombre: normalNombre, precio: 0, fechaInicio: '', fechaFin: '' },
            tarifaPreventa: z.tarifaPreventa ? { ...z.tarifaPreventa, nombre: preventaNombre } : null,
          };
        });
        if (data.fechaFinPreventa) setFechaFinPreventa(data.fechaFinPreventa);
        if (data.fechaInicioPreventa) setFechaInicioPreventa(data.fechaInicioPreventa);
        if (!abort) setZones(mapped);
      } catch (e) {
        console.error("Error cargando zonas del evento", e);
        if (!abort) setError("No se pudieron cargar las zonas del evento.");
      } finally {
        if (!abort) setIsLoading(false);
      }
    };
    fetchZonas();
    return () => { abort = true; };
  }, [eventoId, buildTarifaNombre]);

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.substring(commaIdx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleUploadMapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (!/(image\/png|image\/jpeg)/.test(file.type)) {
      NotificationService.warning('Solo se permiten imágenes PNG o JPG');
      return;
    }
    if (!eventoId) return;
    try {
      setIsSaving(true);
      setError(null);
      const base64 = await fileToBase64(file);
      const detalle = await obtenerEventosDetallados(eventoId) as EventoDetalladoMin;
      const artistaId = detalle.artist?.id || 0;
      if (!artistaId) {
        NotificationService.error('No se puede subir imagen: evento sin artista asignado');
        return;
      }
      const payload = {
        nombre: detalle.title,
        descripcion: detalle.description,
        fecha: detalle.date,
        hora: detalle.time || '00:00',
        artistaId,
        departamento: detalle.departamento || '',
        provincia: detalle.provincia || '',
        distrito: detalle.distrito || '',
        lugar: detalle.place || '',
        estado: mapEstadoUIToBackend(eventoEstadoUI),
        imagenLugar: base64,
      };
      const resp = await actualizarEvento(eventoId, payload) as ActualizarEventoResponse;
      if (!resp?.success) {
        NotificationService.error('No se pudo guardar la imagen del lugar');
        return;
      }
      const actualizado = await EventoService.obtenerPorId(eventoId) as EventoDetalladoMin;
      const nuevaImg = actualizado.imageLugar || actualizado.imagenLugar || base64;
      setImageLugarBase64(nuevaImg);
      NotificationService.success('Imagen del lugar actualizada');
    } catch (err) {
      console.error('Error subiendo imagenLugar', err);
      NotificationService.error('Error al subir la imagen del lugar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddZone = () => {
    const nuevaZona: Zone = {
      nombre: `Zona ${zones.length + 1}`,
      capacidad: 0,
      cantidadComprada: 0,
      tarifaNormal: { nombre: buildTarifaNombre(undefined, 'Normal'), fechaInicio: '', fechaFin: '', precio: 0 },
      tarifaPreventa: { nombre: buildTarifaNombre(undefined, 'Preventa'), fechaInicio: '', fechaFin: '', precio: 0 },
    };
    setZones(prev => [...prev, nuevaZona]);
  };

  const handleChangeTarifa = (index: number, tipo: 'normal' | 'preventa', value: string) => {
    setZones(prev => {
      const next = [...prev];
      const zona = next[index];
      const key: 'tarifaNormal' | 'tarifaPreventa' = tipo === 'normal' ? 'tarifaNormal' : 'tarifaPreventa';
      const tarifaActual = zona[key];
      if (!tarifaActual) {
        zona[key] = { nombre: buildTarifaNombre(undefined, tipo === 'normal' ? 'Normal' : 'Preventa'), fechaInicio: '', fechaFin: '', precio: 0 } as Tarifa;
      }
      (zona[key] as Tarifa).precio = value === '' ? 0 : Number(value);
      next[index] = { ...zona };
      return next;
    });
  };

  const handleChangeCampo = (index: number, field: keyof Zone, value: string | number) => {
    setZones(prev => {
      const next = [...prev];
      // @ts-expect-error asignación dinámica controlada
      next[index][field] = field === 'capacidad' ? Number(value) : value;
      next[index] = { ...next[index] };
      return next;
    });
  };

  const handleEliminar = (index: number) => setZones(prev => prev.filter((_, i) => i !== index));

  const handleGuardar = async () => {
    if (!eventoId) return;
    try {
      setIsSaving(true);
      const detalle = await obtenerEventosDetallados(eventoId) as EventoDetalladoMin;
      const fechaEvento = detalle.date;
      // Validaciones
      if (fechaFinPreventa && fechaFinPreventa > fechaEvento) {
        NotificationService.error('La fecha fin de preventa no puede ser posterior al evento');
        return;
      }
      if (fechaInicioPreventa && fechaInicioPreventa > fechaEvento) {
        NotificationService.error('La fecha inicio de preventa no puede ser posterior al evento');
        return;
      }
      if (fechaInicioPreventa && fechaFinPreventa && fechaFinPreventa < fechaInicioPreventa) {
        NotificationService.error('La fecha fin de preventa no puede ser menor que la fecha inicio');
        return;
      }
      const zonasDto = zones.map(z => {
        const finPrev = fechaFinPreventa || fechaEvento;
        const iniPrev = fechaInicioPreventa || finPrev;
        return {
          id: z.id,
          nombre: z.nombre.trim(),
          capacidad: z.capacidad,
          cantidadComprada: z.cantidadComprada ?? 0,
          tarifaNormal: z.tarifaNormal ? {
            id: z.tarifaNormal.id,
            nombre: buildTarifaNombre(z.tarifaNormal.nombre, 'Normal'),
            precio: z.tarifaNormal.precio,
            fechaInicio: finPrev,
            fechaFin: fechaEvento,
          } : null,
          tarifaPreventa: fechaFinPreventa ? (z.tarifaPreventa ? {
            id: z.tarifaPreventa.id,
            nombre: buildTarifaNombre(z.tarifaPreventa.nombre, 'Preventa'),
            precio: z.tarifaPreventa.precio,
            fechaInicio: iniPrev,
            fechaFin: finPrev,
          } : {
            nombre: buildTarifaNombre(undefined, 'Preventa'),
            precio: 0,
            fechaInicio: iniPrev,
            fechaFin: finPrev,
          }) : null,
        };
      });
      const hayConadis = zones.some(z => z.nombre.toLowerCase() === 'conadis');
      if (!hayConadis) {
        NotificationService.error("Debe haber una zona llamada 'Conadis' para personas con discapacidad");
        return;
      }
      const payload = {
        nombre: detalle.title,
        descripcion: detalle.description,
        fecha: detalle.date,
        hora: detalle.time || '00:00',
        artistaId: detalle.artist?.id || 0,
        departamento: detalle.departamento || '',
        provincia: detalle.provincia || '',
        distrito: detalle.distrito || '',
        lugar: detalle.place || '',
        estado: mapEstadoUIToBackend(eventoEstadoUI),
        zonas: zonasDto,
        fechaFinPreventa: fechaFinPreventa || null,
        fechaInicioPreventa: fechaInicioPreventa || null,
      };

      const resp = await actualizarEvento(eventoId, payload) as ActualizarEventoResponse;
      if (!resp?.success) {
        NotificationService.error('No se pudo guardar la configuración');
        return;
      }
      const postData = await obtenerEventosDetallados(eventoId) as EventoDetalleZonasRaw;
      const nuevasZonasRaw = postData.zonas || [];
      const recargadas: Zone[] = nuevasZonasRaw.map(z => ({
        id: z.id,
        nombre: z.nombre,
        capacidad: z.capacidad,
        cantidadComprada: z.cantidadComprada,
        tarifaNormal: z.tarifaNormal as Tarifa,
        tarifaPreventa: (z.tarifaPreventa as Tarifa) || null,
      }));
      setZones(recargadas);
      NotificationService.success('Configuración guardada');
    } catch (e) {
      console.error('Error guardando configuración', e);
      NotificationService.error('Error al guardar la configuración de zonas');
    } finally {
      setIsSaving(false);
    }
  };

  const buildImageSrc = (value?: string | null): string | null => {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;
    if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:')) return v;
    return `data:image/*;base64,${v}`;
  };

  const getZonaImageSrc = (z: unknown): string | null => {
    const obj = (typeof z === 'object' && z !== null) ? (z as Record<string, unknown>) : undefined;
    if (!obj) return null;
    const candidates = ['mapaUrl','imagenUrl','imageUrl','mapa','imagen','image','mapaBase64','imagenBase64'];
    for (const key of candidates) {
      const val = typeof obj[key] === 'string' ? obj[key] as string : undefined;
      const candidate = buildImageSrc(val);
      if (candidate) return candidate;
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 dark:bg-card p-2 rounded-md">
          <MapPin className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Zonas y tarifas diferenciadas</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configura las zonas del evento con precios y preventa.</p>
        </div>
      </div>

      {/* Imagen del lugar */}
      <label className="border-2 border-dashed border-gray-300 dark:border-border rounded-md flex flex-col items-center justify-center h-48 mb-5 text-gray-500 dark:text-card-foreground hover:bg-gray-50 dark:hover:bg-card cursor-pointer relative overflow-hidden">
        {imageLugarBase64 ? (
          <img
            src={imageLugarBase64}
            alt="Mapa / Imagen del lugar"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <Upload className="h-6 w-6 mb-2" />
            <p className="text-sm">Haz clic para subir imagen del lugar (PNG/JPG)</p>
            <p className="text-xs text-gray-400 dark:text-gray-400">Tamaño recomendado: 1200×600 px</p>
          </>
        )}
        <input type="file" accept="image/png,image/jpeg" onChange={handleUploadMapa} className="hidden" />
        {imageLugarBase64 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Reemplazar</div>
        )}
      </label>

      {isLoading && <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">Cargando zonas...</div>}
      {error && !isLoading && <div className="text-sm text-red-600 mb-4">{error}</div>}

      {/* Fechas globales preventa */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-row flex-wrap gap-6">
            <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Fecha inicio de preventa (global)</label>
            <input
              type="date"
              value={fechaInicioPreventa}
              onChange={(e) => setFechaInicioPreventa(e.target.value)}
              max={fechaFinPreventa || undefined}
              className="border border-gray-300 dark:border-border rounded-md px-2 py-1 w-60 bg-white dark:bg-card dark:text-card-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Fecha fin de preventa (global)</label>
            <input
              type="date"
              value={fechaFinPreventa}
              onChange={(e) => setFechaFinPreventa(e.target.value)}
              min={fechaInicioPreventa || undefined}
              className="border border-gray-300 dark:border-border rounded-md px-2 py-1 w-60 bg-white dark:bg-card dark:text-card-foreground"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">La venta normal inicia en la fecha fin de la preventa y termina en la fecha del evento.</p>
      </div>

      {/* Tabla de zonas */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-card text-gray-700 dark:text-card-foreground font-medium border-b border-gray-200 dark:border-border">
            <tr>
              <th className="px-4 py-2 text-left">Zona</th>
              <th className="px-4 py-2 text-left">Capacidad</th>
              <th className="px-4 py-2 text-left">Precio normal</th>
              <th className="px-4 py-2 text-left">Precio preventa</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Este evento no tiene zonas registradas.
                </td>
              </tr>
            ) : (
              zones.map((z, i) => (
                <tr key={z.id || i} className="border-t border-gray-200 dark:border-border">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const src = getZonaImageSrc(z);
                        return src ? <img src={src} alt={`Mapa ${z.nombre}`} className="w-10 h-10 rounded object-cover border border-gray-200 dark:border-border" /> : null;
                      })()}
                      <input
                        type="text"
                        value={z.nombre}
                        onChange={(e) => handleChangeCampo(i, 'nombre', e.target.value)}
                        className="border border-gray-300 dark:border-border rounded-md px-2 py-1 w-full bg-white dark:bg-card dark:text-card-foreground"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.capacidad}
                      onChange={(e) => handleChangeCampo(i, 'capacidad', e.target.value)}
                      className="border border-gray-300 dark:border-border rounded-md px-2 py-1 w-full bg-white dark:bg-card dark:text-card-foreground"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.tarifaNormal?.precio ?? ''}
                      onChange={(e) => handleChangeTarifa(i, 'normal', e.target.value)}
                      className="border border-gray-300 dark:border-border rounded-md px-2 py-1 w-full bg-white dark:bg-card dark:text-card-foreground"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={z.tarifaPreventa?.precio ?? ''}
                      onChange={(e) => handleChangeTarifa(i, 'preventa', e.target.value)}
                      className="border border-gray-300 dark:border-border rounded-md px-2 py-1 w-full bg-white dark:bg-card dark:text-card-foreground"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleEliminar(i)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm">
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Botones */}
      <div className="flex justify-between mt-4">
        <button onClick={handleAddZone} className="bg-amber-500 text-white dark:text-gray-900 text-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-amber-600 cursor-pointer">
          <Plus className="h-4 w-4" /> Agregar zona
        </button>
        <button onClick={handleGuardar} disabled={isSaving} className="bg-gray-900 disabled:opacity-60 text-white text-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-800 cursor-pointer">
          <Save className="h-4 w-4" /> {isSaving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>

      {/* Info imagen lugar */}
      <div className="mt-4">
          {!imageLugarBase64 && ( 
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ImageOff className="h-4 w-4" /> No hay imagen del lugar 
            </div> 
          )}
      </div>
    </div>
  );
};

export default ZonasYTarifasCard;
export type { ZonasYTarifasCardProps };
