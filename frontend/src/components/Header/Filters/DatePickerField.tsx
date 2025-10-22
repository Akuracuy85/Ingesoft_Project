import React, { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ---------- 1️⃣ Botón del input ----------
const ButtonInput = React.forwardRef(
  ({ value, onClick }: { value?: string; onClick?: () => void }, ref: any) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between w-full border border-gray-300 rounded-lg p-2 text-gray-700 cursor-pointer bg-white hover:bg-gray-50 shadow-sm transition"
    >
      <span>{value || "DD/MM/AAAA"}</span>
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
    </button>
  )
);

// ---------- 2️⃣ Header del calendario ----------
const CalendarHeader = ({
  monthDate,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  setCurrentMonth,
}: any) => {
  // 🔹 Guardamos el mes actualmente mostrado
  React.useEffect(() => {
    setCurrentMonth(monthDate);
  }, [monthDate]);

  return (
    <div className="flex items-center justify-between px-2 py-2 bg-gray-100 border-b border-gray-200 rounded-t-xl">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="text-gray-600 hover:text-gray-800 px-3"
      >
        {"<"}
      </button>

      <div className="text-gray-700 font-medium text-center flex-1">
        {monthDate.toLocaleString("es-ES", { month: "long", year: "numeric" })}
      </div>

      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="text-gray-600 hover:text-gray-800 px-3"
      >
        {">"}
      </button>
    </div>
  );
};

export const DatePickerField = ({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const pickerRef = useRef<DatePicker>(null!);

  return (
    <div className="flex flex-col flex-1">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <DatePicker
        ref={pickerRef}
        selected={value}
        onChange={(date) => date && onChange(date)}
        minDate={minDate}
        dateFormat="dd/MM/yyyy"
        customInput={<ButtonInput />}
        renderCustomHeader={(headerProps) => (
          <CalendarHeader {...headerProps} setCurrentMonth={setCurrentMonth} />
        )}
        // 🔹 Solo permite seleccionar días del mes actualmente mostrado
        filterDate={(date) => date.getMonth() === currentMonth.getMonth()}
      />
    </div>
  );
};