import { useState } from "react";
import { Plus, DollarSign } from "lucide-react";

interface Tarifa {
  zona: string;
  precio: number | "";
  capacidad: number | "";
  descuento: number | "";
}

export default function TarifasCard() {
  const [tarifas, setTarifas] = useState<Tarifa[]>([
    { zona: "VIP", precio: 150, capacidad: 100, descuento: 10 },
    { zona: "Platea", precio: 80, capacidad: 300, descuento: 5 },
    { zona: "General", precio: 40, capacidad: 500, descuento: 0 },
  ]);

  const handleChange = (index: number, field: keyof Tarifa, value: string) => {
    setTarifas((prev) => {
      const next = [...prev];
      const t = next[index];
      if (!t) return prev;
      switch (field) {
        case "zona":
          t.zona = value;
          break;
        case "precio":
          t.precio = value === "" ? "" : Number(value);
          break;
        case "capacidad":
          t.capacidad = value === "" ? "" : Number(value);
          break;
        case "descuento":
          t.descuento = value === "" ? "" : Number(value);
          break;
      }
      return next;
    });
  };

  const handleAddTarifa = () => {
    setTarifas([...tarifas, { zona: "", precio: "", capacidad: "", descuento: "" }]);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <DollarSign className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Tarifas diferenciadas</h3>
          <p className="text-sm text-gray-500">Define precios por zona y capacidad.</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2">Zona</th>
              <th className="text-left px-4 py-2">Precio</th>
              <th className="text-left px-4 py-2">Capacidad</th>
              <th className="text-left px-4 py-2">Descuento %</th>
            </tr>
          </thead>
          <tbody>
            {tarifas.map((t, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={t.zona}
                    onChange={(e) => handleChange(i, "zona", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                    placeholder="Ej: VIP"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={t.precio}
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
                    value={t.capacidad}
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
                    value={t.descuento}
                    onChange={(e) => handleChange(i, "descuento", e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full text-sm"
                    min={0}
                    max={100}
                    step={1}
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón agregar */}
      <button
        onClick={handleAddTarifa}
        className="mt-4 w-full border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 text-sm font-medium"
        type="button"
        aria-label="Agregar tarifa"
      >
        <Plus className="h-4 w-4" /> Agregar tarifa
      </button>
    </div>
  );
}
