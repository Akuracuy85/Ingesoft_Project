import { useState } from "react";
import { DatePickerField } from "./DatePickerField";

export const DateRangePicker = () => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  return (
    <div className="mb-10">
      <h3 className="text-lg font-medium mb-3">Fechas</h3>

      <div className="flex gap-4 w-full">
        <DatePickerField
          label="Inicio"
          value={fromDate}
          onChange={setFromDate}
          minDate={new Date()} // desde hoy en adelante
        />
        <DatePickerField
          label="Fin"
          value={toDate}
          onChange={setToDate}
          minDate={fromDate || new Date()} // no permitir días antes de inicio
        />
      </div>

    </div>
  );
};