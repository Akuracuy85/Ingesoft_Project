import React, { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// 🔹 Botón custom para el input del datepicker
const ButtonInput = React.forwardRef(
  ({ value, onClick }: { value?: string; onClick?: () => void }, ref: any) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between w-full border border-gray-300 rounded-lg p-2 text-gray-700 cursor-pointer bg-white hover:bg-gray-50 shadow-sm transition dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      <span>{value || "DD/MM/AAAA"}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-500 dark:text-gray-300"
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

// 🔹 Header custom del calendario
const CalendarHeader = ({
  monthDate,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  setCurrentMonth,
}: any) => {
  React.useEffect(() => {
    setCurrentMonth(monthDate);
  }, [monthDate]);

  return (
    <div className="flex items-center justify-between px-2 py-2 bg-gray-100 border-b border-gray-200 rounded-t-xl dark:bg-gray-800 dark:border-gray-700">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="text-gray-600 hover:text-gray-800 px-3 dark:text-gray-300 dark:hover:text-white"
      >
        {"<"}
      </button>

      <div className="text-gray-700 font-medium text-center flex-1 dark:text-gray-200">
        {monthDate.toLocaleString("es-ES", { month: "long", year: "numeric" })}
      </div>

      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="text-gray-600 hover:text-gray-800 px-3 dark:text-gray-300 dark:hover:text-white"
      >
        {">"}
      </button>
    </div>
  );
};

// 🔹 Props tipadas del DatePickerField
type DatePickerFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
};

export const DatePickerField = ({
  label,
  value,
  onChange,
  minDate,
}: DatePickerFieldProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const pickerRef = useRef<DatePicker>(null!);

  return (
    <div className="flex flex-col flex-1 min-w-0">
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