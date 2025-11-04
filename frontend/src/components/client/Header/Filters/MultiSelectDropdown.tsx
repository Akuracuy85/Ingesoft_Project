// src/components/Filters/MultiSelectDropdown.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react"; 

// NUEVO TIPO: Ahora las opciones tienen ID y Nombre
export interface MultiOption {
    id: string;    // El valor que el BE espera (e.g., "2" o "5")
    nombre: string; // El valor que el usuario ve (e.g., "Música Rock")
}

interface MultiSelectDropdownProps {
  label: string;
  options: MultiOption[]; // Usa el nuevo tipo MultiOption
  value: string[]; // Array de IDs seleccionados
  onChange: (val: string[]) => void;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  value, 
  onChange, 
}) => {
  const [open, setOpen] = useState(false);
  // El estado interno es la lista de IDs seleccionados
  const [selectedIds, setSelectedIds] = useState<string[]>(value); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener los NOMBRES seleccionados para mostrar en la UI
  const selectedNames = options
    .filter((opt) => selectedIds.includes(opt.id))
    .map((opt) => opt.nombre);
  
  // Sincronizar estado interno con el prop 'value'
  useEffect(() => {
    setSelectedIds(value);
  }, [value]);
  
  // Llamar a onChange del padre cuando el estado interno cambia
  useEffect(() => {
    onChange(selectedIds); 
  }, [selectedIds, onChange]); 


  // Alternar por ID (usamos useCallback para evitar re-renderizados innecesarios)
  const toggleOption = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }, []);

  // Cierra el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);


  return (
    <div className="mb-6 relative multi-dropdown" ref={dropdownRef}>
      <h3 className="text-lg font-medium mb-2">{label}</h3>

      {/* Selector visible */}
      <div
        className="border border-gray-300 rounded p-2 cursor-pointer flex flex-wrap gap-2 min-h-[44px] items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        {/* Contenido seleccionado: Muestra NOMBRES */}
        <div className="flex flex-wrap gap-2 flex-1">
          {selectedIds.length === 0 && (
            <span className="text-gray-400">Selecciona...</span>
          )}
          {selectedNames.map((name) => (
            <span
              key={name}
              className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1"
            >
              {name}
              <button
                className="text-sm font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                    const idToRemove = options.find(opt => opt.nombre === name)?.id;
                    if (idToRemove) toggleOption(idToRemove);
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Flechita */}
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* Dropdown con checkboxes */}
      {open && (
        <div className="absolute mt-2 w-full border border-gray-300 bg-white rounded shadow-lg max-h-48 overflow-y-auto z-10">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                className="accent-indigo-600"
              />
              <span>{option.nombre}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};