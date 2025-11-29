// src/components/Filters/MultiSelectDropdown.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

// TIPO DE OPCIÓN
export interface MultiOption {
  id: string;
  nombre: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: MultiOption[];
  value: string[];
  onChange: (val: string[]) => void;
  // 🛑 CORRECCIÓN: Agregar la propiedad 'disabled'
  disabled?: boolean;
  menuMaxHeight?: string; // optional inline max-height like '20px'
  // Valor por defecto razonable para la altura máxima del menú (se puede sobreescribir)
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  // 🛑 CORRECCIÓN: Desestructurar la propiedad 'disabled' con valor por defecto
  disabled = false,
  menuMaxHeight = "240px",
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
    // 🛑 RENDERIZADO: Aplicar estilos de deshabilitado si 'disabled' es true
    <div className={`mb-6 relative multi-dropdown ${disabled ? 'opacity-50 cursor-not-allowed' : ''} min-w-0`} ref={dropdownRef}>
      <h3 className="text-lg font-medium mb-2 dark:text-gray-200">{label}</h3>

      {/* Selector visible */}
      <div
        className="border border-gray-300 rounded p-2 cursor-pointer flex flex-wrap gap-2 min-h-[44px] items-center justify-between dark:border-gray-600 dark:bg-gray-800"
        // 🛑 RENDERIZADO: Bloquear el clic si está deshabilitado
        onClick={() => !disabled && setOpen(!open)}
      >
        {/* Contenido seleccionado: Muestra NOMBRES */}
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          {selectedIds.length === 0 && (
            <span className="text-gray-400 dark:text-gray-300">Selecciona...</span>
          )}
          {selectedNames.map((name) => (
            <span
              key={name}
              className="bg-[#F6BA26]/20 text-[#C37723] px-2 py-1 rounded-full flex items-center gap-1 dark:bg-[#F6BA26]/20 dark:text-[#C37723]"
            >
              {name}
              <button
                className="text-sm font-bold"
                // 🛑 RENDERIZADO: Bloquear el clic del botón si está deshabilitado
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled) return; // Salir si está deshabilitado
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
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
            } dark:text-gray-300`}
        />
      </div>

      {/* Dropdown con checkboxes */}
      {open && (
        <div
          className="absolute mt-2 w-full border border-gray-300 bg-white rounded shadow-lg overflow-y-auto z-10 dark:bg-gray-800 dark:border-gray-600"
          style={{ maxHeight: menuMaxHeight }}
        >
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                // 🛑 RENDERIZADO: Bloquear el cambio de checkbox si está deshabilitado
                onChange={() => !disabled && toggleOption(option.id)}
                className="accent-[#F6BA26]"
                disabled={disabled} // También deshabilitar el input nativo
              />
              <span>{option.nombre}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};