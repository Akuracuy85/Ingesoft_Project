import React, { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// SVG de calendario
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// Componente customInput estilo botón con icono
const ButtonInput = forwardRef(
  ({ value, onClick }: { value?: string; onClick?: () => void }, ref: any) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between w-full border border-gray-300 rounded p-2 text-gray-700 cursor-pointer bg-white hover:bg-gray-50"
    >
      <span>{value || "DD/MM/AAAA"}</span>
      <CalendarIcon />
    </button>
  )
);

export const DateRangePicker = () => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  return (
    <div className="mb-10">
      <h3 className="text-lg font-medium mb-3">Fechas</h3>

      <div className="flex gap-4 w-full">
        {/* Fecha de inicio */}
        <div className="flex flex-col flex-1">
          <label className="text-sm text-gray-600 mb-1">Inicio</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            minDate={new Date()}
            customInput={<ButtonInput />}
            dateFormat="dd/MM/yyyy"
          />
        </div>

        {/* Fecha de fin */}
        <div className="flex flex-col flex-1">
          <label className="text-sm text-gray-600 mb-1">Fin</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            minDate={fromDate || new Date()}
            customInput={<ButtonInput />}
            dateFormat="dd/MM/yyyy"
          />
        </div>
      </div>
    </div>
  );
};
