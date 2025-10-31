import { useState } from "react";
import { MapPin, Upload, Plus, Trash2, Save, ImageOff } from "lucide-react";

interface Zona {
  id: number;
  nombre: string;
  precio: number | "";
  capacidad: number | "";
  descuento: number | "";
  color: string;
}

function generarColorAleatorio() {
  // color suave aleatorio
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default function ZonasYTarifasCard() {
  const [zonas, setZonas] = useState<Zona[]>([
    { id: 1, nombre: "VIP", precio: 150, capacidad: 100, descuento: 10, color: "#f59e0b" },
    { id: 2, nombre: "Platea", precio: 80, capacidad: 300, descuento: 5, color: "#3b82f6" },
    { id: 3, nombre: "General", precio: 40, capacidad: 500, descuento: 0, color: "#10b981" },
  ]);

  const [mapa, setMapa] = useState<File | null>(null);

  const handleAddZona = () => {
    const nuevaZona: Zona = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      nombre: `Zona ${zonas.length + 1}`,
      precio: "",
      capacidad: "",
      descuento: "",
      color: generarColorAleatorio(),
    };
    setZonas((prev) => [...prev, nuevaZona]);
  };

  const handleChange = (index: number, field: keyof Zona, value: string) => {
    setZonas((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      switch (field) {
        case "precio":
        case "capacidad":
        case "descuento":
          item[field] = value === "" ? "" : Number(value);
          break;
        case "nombre":
        case "color":
        default:
          // @ts-expect-error asignación por campo string
          item[field] = value;
          break;
      }
      next[index] = { ...item };
      return next;
    });
  };

  const handleRemoveZona = (index: number) => {
    setZonas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadMapa = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setMapa(e.target.files[0]);
  };

  const handleGuardar = () => {
    alert("Configuración de zonas guardada correctamente.");
    console.log("Zonas guardadas:", zonas);
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
              <tr key={z.id} className="border-t border-gray-200">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={z.nombre}
                    onChange={(e) => handleChange(i, "nombre", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                    placeholder={`Zona ${i + 1}`}
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
                    aria-label={`Eliminar zona ${i + 1}`}>
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
        <button
          onClick={handleAddZona}
          className="bg-amber-500 text-white text-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-amber-600"
          type="button"
        >
          <Plus className="h-4 w-4" /> Agregar zona
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGuardar}
            className="bg-gray-900 text-white text-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-800"
            type="button"
          >
            <Save className="h-4 w-4" /> Guardar configuración
          </button>
        </div>
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

