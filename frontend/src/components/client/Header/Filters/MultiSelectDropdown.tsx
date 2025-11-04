// src/components/Filters/MultiSelectDropdown.tsx (CORREGIDO)

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react"; 

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  value: string[]; // lista seleccionada (desde el padre)
  onChange: (val: string[]) => void; // callback al cambiar selección  
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  value, // 🛑 Añadir 'value' a la desestructuración
  onChange, // 🛑 Añadir 'onChange' a la desestructuración
}) => {
  const [open, setOpen] = useState(false);
  // 🛑 Inicializar el estado interno 'selected' con el prop 'value'
  const [selected, setSelected] = useState<string[]>(value); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🛑 Sincronizar estado interno y externo
  useEffect(() => {
    setSelected(value);
  }, [value]);
  
  // 🛑 Llamar a onChange del padre cuando el estado interno cambia
  useEffect(() => {
    onChange(selected);
  }, [selected]); // 🛑 Dependency array solo incluye 'selected'


  const toggleOption = (option: string) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // 🔹 Cierra el dropdown si se hace clic fuera
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
        {/* Contenido seleccionado */}
        <div className="flex flex-wrap gap-2 flex-1">
          {selected.length === 0 && (
            <span className="text-gray-400">Selecciona...</span>
          )}
          {selected.map((item) => (
            <span
              key={item}
              className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1"
            >
              {item}
              <button
                className="text-sm font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* 🔽 Flechita del dropdown */}
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
              key={option}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="accent-indigo-600"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};