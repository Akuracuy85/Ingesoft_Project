import type { DateRangeType } from "../../../../types/DateRangeType";
import { DatePickerField } from "./DatePickerField";

type DateRangePickerProps = {
  value: DateRangeType;
  onChange: (value: DateRangeType) => void;
};

export const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-medium mb-3">Fechas</h3>

      <div className="flex gap-4 w-full">
        <DatePickerField
          label="Inicio"
          value={value.start}
          onChange={(date) => onChange({ start: date, end: value.end })}
          minDate={new Date()} // desde hoy en adelante
        />

        <DatePickerField
          label="Fin"
          value={value.end}
          onChange={(date) => onChange({ start: value.start, end: date })}
          minDate={value.start || new Date()} // no permitir días antes de inicio
        />
      </div>
    </div>
  );
};