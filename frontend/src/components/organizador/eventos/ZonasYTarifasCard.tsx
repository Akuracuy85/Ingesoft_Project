import { useState } from "react";
import { MapPin, Upload, Plus, Trash2, Save, ImageOff } from "lucide-react";
import type { Zone } from "@/models/Zone";
import type { Tarifa } from "@/models/Tarifa";

type TarifaUI = Partial<Tarifa> & { precio?: number; descuento?: number };

export default function ZonasYTarifasCard() {
  const [zones, setZones] = useState<Zone[]>([
    {
      id: 1,
      nombre: "VIP",
      capacidad: 100,
      tarifaNormal: { precio: 150, descuento: 0 },
      tarifaPreventa: { precio: 120, descuento: 10 },
    },
    {
      id: 2,
      nombre: "Platea",
      capacidad: 300,
      tarifaNormal: { precio: 80, descuento: 0 },
      tarifaPreventa: { precio: 70, descuento: 5 },
    },
  ]);

  const [mapa, setMapa] = useState<File | null>(null);

  const handleAddZone = () => {
    const nuevaZona: Zone = {
      nombre: `Zona ${zones.length + 1}`,
      capacidad: 0,
      tarifaNormal: { precio: 0, descuento: 0 },
      tarifaPreventa: { precio: 0, descuento: 0 },
    };
    setZones((prev) => [...prev, nuevaZona]);
  };

  const handleChangeTarifa = (
    index: number,
    tipo: "normal" | "preventa",
    field: "precio" | "descuento",
    value: string
  ) => {
    setZones((prev) => {
      const next = [...prev];
      const tarifa = tipo === "normal" ? (next[index].tarifaNormal as TarifaUI | undefined) : (next[index].tarifaPreventa as TarifaUI | undefined);
      if (!tarifa) {
        // inicializar si no existe
        const nueva: TarifaUI = { precio: 0, descuento: 0 };
        if (tipo === "normal") next[index] = { ...next[index], tarifaNormal: nueva };
        else next[index] = { ...next[index], tarifaPreventa: nueva };
      }
      // actualizar el valor (asegurando conversión numérica)
      const tarifaObj = tipo === "normal" ? (next[index].tarifaNormal as TarifaUI) : (next[index].tarifaPreventa as TarifaUI);
      tarifaObj[field] = value === "" ? 0 : Number(value);
      next[index] = { ...next[index], tarifaNormal: next[index].tarifaNormal, tarifaPreventa: next[index].tarifaPreventa };
      return next;
    });
  };

  const handleChangeCampo = (index: number, field: keyof Zone, value: string | number) => {
    setZones((prev) => {
      const next = [...prev];
      // @ts-expect-error asignación dinámica
      next[index][field] = field === "capacidad" ? Number(value) : value;
      next[index] = { ...next[index] };
      return next;
    });
  };

  const handleEliminar = (index: number) => setZones((prev) => prev.filter((_, i) => i !== index));

  const handleUploadMapa = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setMapa(e.target.files[0]);
  };

  const handleGuardar = () => {
    console.log("Zonas guardadas:", zones);
    alert("Configuración de zonas guardada correctamente");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <MapPin className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Zonas y tarifas diferenciadas</h3>
          <p className="text-sm text-gray-500">Configura las zonas del evento con mapa, precios y descuentos.</p>
        </div>
      </div>

      {/* Subida de mapa */}
      <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-40 mb-5 text-gray-500 hover:bg-gray-50 cursor-pointer">
        <Upload className="h-6 w-6 mb-2" />
        <p className="text-sm">Arrastra archivos aquí o haz clic para seleccionar</p>
        <p className="text-xs text-gray-400">PDF, PNG, JPG. Tamaño recomendado: 1200×600 px</p>
        <input type="file" accept="image/*" onChange={handleUploadMapa} className="hidden" />
      </label>

      {/* Tabla de zonas y tarifas */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Zona</th>
              <th className="px-4 py-2 text-left">Capacidad</th>
              <th className="px-4 py-2 text-left">Precio normal</th>
              <th className="px-4 py-2 text-left">Precio preventa</th>
              <th className="px-4 py-2 text-left">Descuento preventa (%)</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z, i) => (
              <tr key={z.id || i} className="border-t border-gray-200">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={z.nombre}
                    onChange={(e) => handleChangeCampo(i, "nombre", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={z.capacidad}
                    onChange={(e) => handleChangeCampo(i, "capacidad", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={z.tarifaNormal?.precio ?? ""}
                    onChange={(e) => handleChangeTarifa(i, "normal", "precio", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={z.tarifaPreventa?.precio ?? ""}
                    onChange={(e) => handleChangeTarifa(i, "preventa", "precio", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={z.tarifaPreventa?.descuento ?? ""}
                    onChange={(e) => handleChangeTarifa(i, "preventa", "descuento", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEliminar(i)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm">
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botones */}
      <div className="flex justify-between mt-4">
        <button onClick={handleAddZone} className="bg-amber-500 text-white text-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-amber-600">
          <Plus className="h-4 w-4" /> Agregar zona
        </button>
        <button onClick={handleGuardar} className="bg-gray-900 text-white text-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-800">
          <Save className="h-4 w-4" /> Guardar configuración
        </button>
      </div>

      {/* Vista previa del mapa (debajo) */}
      <div className="mt-4">
        {mapa ? (
          <div className="text-sm text-gray-700">Mapa seleccionado: {mapa.name}</div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ImageOff className="h-4 w-4" /> No hay mapa del estadio
          </div>
        )}
      </div>
    </div>
  );
}
