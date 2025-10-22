import React, { useState } from "react";

interface PriceInputProps {
  value: string;
  setValue: (v: string) => void;
  handleFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>, setter: (v: string) => void, min?: number) => void;
  min: number;
}

const PriceInput: React.FC<PriceInputProps> = ({ value, setValue, handleFocus, handleBlur, min }) => (
  <div className="relative flex-1">
    <span className="absolute left-3 top-2 text-gray-500">S/.</span>
    <input
      type="number"
      min={min}
      step="0.01"
      placeholder="0.00"
      value={value}
      onChange={(e) => {
        let val = e.target.value;

        // Permitir vacío
        if (val === "") {
          setValue(val);
          return;
        }

        // Evitar valores menores a min
        if (parseFloat(val) < min) return;

        // Formatear máximo 2 decimales mientras se escribe
        if (val.includes(".")) {
          const [intPart, decPart] = val.split(".");
          val = intPart + "." + decPart.slice(0, 2);
        }

        setValue(val);
      }}
      onFocus={handleFocus}
      onBlur={(e) => {
        handleBlur(e, setValue, min);

        // Forzar 2 decimales al salir
        if (e.currentTarget.value) {
          let num = parseFloat(e.currentTarget.value);
          if (num < min) num = min;
          setValue(num.toFixed(2));
        }
      }}
      className="w-full pl-10 border border-gray-300 rounded p-2 text-gray-400"
    />
  </div>
);

export const PriceRangeInput: React.FC = () => {
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [error, setError] = useState("");

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.classList.remove("text-gray-400");
    e.currentTarget.classList.add("text-black");
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    setter: (v: string) => void,
    min?: number
  ) => {
    if (!e.currentTarget.value) {
      e.currentTarget.classList.remove("text-black");
      e.currentTarget.classList.add("text-gray-400");
      return;
    }

    let num = parseFloat(e.currentTarget.value);
    if (min !== undefined && num < min) num = min;

    setter(num.toFixed(2));
  };

  // Revisar errores cada vez que cambian los valores
  const validate = (from: string, to: string) => {
    if (from && to && parseFloat(to) < parseFloat(from)) {
      setError("El precio final no puede ser menor que el inicial.");
    } else {
      setError("");
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Rango de precios</h3>
      <div className="flex gap-4">
        {/* Precio inicial */}
        <PriceInput
          value={fromValue}
          setValue={(val) => {
            setFromValue(val);
            validate(val, toValue);
          }}
          handleFocus={handleFocus}
          handleBlur={(e, setter) => handleBlur(e, setter, 0)}
          min={0}
        />

        {/* Precio final */}
        <PriceInput
          value={toValue}
          setValue={(val) => {
            setToValue(val);
            validate(fromValue, val);
          }}
          handleFocus={handleFocus}
          handleBlur={(e, setter) => handleBlur(e, setter, 0)}
          min={0}
        />
      </div>

      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
    </div>
  );
};