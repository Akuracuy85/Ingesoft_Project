// src/components/Filters/DateRangePicker.tsx (FINAL CON DatePickerField)

// Asegúrate de que DateRangeType ahora permita null en sus campos si es necesario, 
// o maneja la lógica de null en este componente.
import type { DateRangeType } from "../../../../types/DateRangeType";
import { DatePickerField } from "./DatePickerField";

// 🛑 INTERFAZ CORREGIDA: Permite que 'value' sea nulo para compatibilidad con FiltersType
type DateRangePickerProps = {
  value: DateRangeType | null; // Acepta null
  onChange: (value: DateRangeType | null) => void;
};

export const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {

    // Extraemos start y end, usando null si el objeto value es null
    const start = value?.start ?? null;
    const end = value?.end ?? null;

    // -------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------

    const handleStartChange = (date: Date | null) => {
        // Si hay una fecha válida (inicio o fin), creamos el objeto. Si ambas son null, enviamos null.
        const newDateRange: DateRangeType | null = date || end ? { start: date, end } : null;
        onChange(newDateRange);
    };

    const handleEndChange = (date: Date | null) => {
        // Si hay una fecha válida (inicio o fin), creamos el objeto. Si ambas son null, enviamos null.
        const newDateRange: DateRangeType | null = date || start ? { start, end: date } : null;
        onChange(newDateRange);
    };
    
    const handleClearDate = () => {
        onChange(null);
    };

    const isClearDisabled = !start && !end;

    return (
        <div className="mb-6 min-w-0">
            <h3 className="text-lg font-medium mb-2 flex justify-between items-center">
                <span>Rango de Fechas</span>
                
                {/* 🛑 BOTÓN DE LIMPIAR NARANJA */}
                <button
                    onClick={handleClearDate}
                    disabled={isClearDisabled}
                    className={`text-xs font-medium px-2 py-1 rounded transition 
                      ${isClearDisabled 
                          ? 'text-gray-400 dark:text-gray-400 cursor-not-allowed' 
                          : 'text-orange-800 bg-orange-100 border border-orange-700 hover:bg-orange-200 dark:text-orange-200 dark:bg-orange-900/20 dark:border-orange-600 dark:hover:bg-orange-800/20'
                      }`}
                >
                    Limpiar
                </button>
            </h3>

          <div className="flex gap-4 w-full">
            <DatePickerField
              label="Inicio"
              value={start} // Usamos la variable 'start' que es Date | null
              onChange={handleStartChange} // Usamos el nuevo handler
              minDate={new Date()} 
            />

            <DatePickerField
              label="Fin"
              value={end} // Usamos la variable 'end' que es Date | null
              onChange={handleEndChange} // Usamos el nuevo handler
              // La fecha mínima depende de si 'start' tiene valor o si es hoy
              minDate={start || new Date()} 
            />
          </div>
        </div>
    );
};