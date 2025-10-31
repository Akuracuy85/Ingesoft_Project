import { useState } from "react";
import { MapPin, Upload, Plus, Trash2, ImageOff } from "lucide-react";

interface Zona {
  nombre: string;
  precio: number | "";
  capacidad: number | "";
  descuento: number | "";
  color: string;
}

export default function ZonasCard() {
  const [zonas, setZonas] = useState<Zona[]>([
    { nombre: "VIP", precio: 150, capacidad: 100, descuento: 0, color: "#f59e0b" },
    { nombre: "Platea", precio: 80, capacidad: 300, descuento: 10, color: "#3b82f6" },
    { nombre: "General", precio: 40, capacidad: 500, descuento: 0, color: "#10b981" },
  ]);
  const [mapa, setMapa] = useState<File | null>(null);

  const handleChange = (index: number, field: keyof Zona, value: string) => {
    setZonas((prev) => {
      const next = [...prev];
      const z = next[index];
      if (!z) return prev;
      switch (field) {
        case "nombre":
          z.nombre = value;
          break;
        case "precio":
          z.precio = value === "" ? "" : Number(value);
          break;
        case "capacidad":
          z.capacidad = value === "" ? "" : Number(value);
          break;
        case "descuento":
          z.descuento = value === "" ? "" : Number(value);
          break;
        case "color":
          z.color = value;
          break;
      }
      return next;
    });
  };

  const handleAddZona = () => {
    setZonas((prev) => [...prev, { nombre: "", precio: "", capacidad: "", descuento: "", color: "#cccccc" }]);
  };

  const handleRemoveZona = (index: number) => {
    setZonas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadMapa = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setMapa(e.target.files[0]);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <MapPin className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Zonas diferenciadas</h3>
          <p className="text-sm text-gray-500">Configura las zonas del evento con mapa y precios.</p>
        </div>
      </div>

      {/* Mapa del estadio */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">Mapa del estadio con zonas</h4>
          <label className="border border-gray-300 text-sm rounded-md px-3 py-1.5 flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer">
            <Upload className="h-4 w-4" />
            Subir mapa
            <input type="file" accept="image/*" onChange={handleUploadMapa} className="hidden" />
          </label>
        </div>
        <div className="border-2 border-dashed border-gray-300 bg-white rounded-md h-56 flex flex-col items-center justify-center text-gray-400">
          {mapa ? (
            <p className="text-sm">{mapa.name}</p>
          ) : (
            <>
              <ImageOff className="h-8 w-8 mb-2" />
              <p>No hay mapa del estadio</p>
            </>
          )}
        </div>
      </div>

      {/* Tabla de zonas */}
      <h4 className="text-sm font-medium text-gray-700 mb-2">Tabla de zonas</h4>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2">Zona</th>
              <th className="text-left px-4 py-2">Precio</th>
              <th className="text-left px-4 py-2">Capacidad</th>
              <th className="text-left px-4 py-2">Descuento (%)</th>
              <th className="text-left px-4 py-2">Color</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {zonas.map((z, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={z.nombre}
                    onChange={(e) => handleChange(i, "nombre", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                    placeholder="Ej: VIP"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={z.precio}
                    onChange={(e) => handleChange(i, "precio", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                    min={0}
                    step={0.01}
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={z.capacidad}
                    onChange={(e) => handleChange(i, "capacidad", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                    min={0}
                    step={1}
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={z.descuento}
                    onChange={(e) => handleChange(i, "descuento", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                    min={0}
                    max={100}
                    step={1}
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="color"
                    value={z.color}
                    onChange={(e) => handleChange(i, "color", e.target.value)}
                    className="h-8 w-12 border border-gray-300 rounded-md cursor-pointer"
                    aria-label={`Color de zona ${i + 1}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleRemoveZona(i)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                    type="button"
                    aria-label={`Eliminar zona ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón agregar zona */}
      <button
        onClick={handleAddZona}
        className="mt-4 bg-amber-500 hover:bg-amber-600 text-white rounded-md px-3 py-2 flex items-center gap-2 text-sm"
        type="button"
      >
        <Plus className="h-4 w-4" /> Agregar zona
      </button>
    </div>
  );
}
