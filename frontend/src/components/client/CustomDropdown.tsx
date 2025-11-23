// src/components/Filters/CustomDropdown.tsx
import React, { useState, useRef, useEffect } from "react";

export interface Option {
  id: string;
  nombre: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group min-w-0" ref={dropdownRef}>
      
      {/* Selector visible */}
      <div
        className={`flex items-center justify-between border rounded px-3 py-2 cursor-pointer transition-colors ${
          disabled
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400"
            : `border-gray-300 bg-white hover:border-[#C37723] dark:border-gray-600 dark:hover:border-[#C37723] dark:bg-gray-800`
        }`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span>
          {selectedOption ? selectedOption.nombre : "Todos"}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${
            disabled
              ? "text-gray-300"
              : open
              ? "text-gray-600 rotate-180"
              : "text-gray-600"
          } dark:text-gray-300`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown estilizado */}
      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">Sin opciones</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  value === opt.id ? "bg-[#F6BA26]/20 text-[#C37723] dark:bg-[#F6BA26]/20 dark:text-[#C37723]" : ""
                }`}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                <span className="break-words">{opt.nombre}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
