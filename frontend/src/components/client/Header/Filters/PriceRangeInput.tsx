// src/components/Filters/PriceRangeInput.tsx (FINAL COMPLETO CON LÍMITE 5000)

import React, { useState, useEffect } from "react";
import type { PriceRangeType } from "../../../../types/PriceRangeType";

const CURRENCY_SYMBOL = "S/.";
const MAX_PRICE_LIMIT = 5000; // 🛑 LÍMITE ACTUALIZADO A 5000

// -------------------------------------------------------------
// FUNCIÓN DE RESTRICCIÓN NUMÉRICA (onKeyDown)
// -------------------------------------------------------------

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    // Teclas de control permitidas (Backspace, Delete, Tab, Flechas)
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key);
    
    if (isControlKey) {
        return;
    }
    
    // Si es un número (0-9), lo permitimos.
    if (key.match(/^[0-9]$/)) {
        return;
    }
    
    // Permitir el punto decimal (o coma), pero solo si no existe ya
    if (key === '.' || key === ',') {
        const currentValue = e.currentTarget.value;
        // Solo permitir si no hay ya un separador decimal (punto o coma)
        if (!currentValue.includes('.') && !currentValue.includes(',')) {
            return;
        }
    }

    // Bloquear cualquier otra tecla
    e.preventDefault();
};


// -------------------------------------------------------------
// COMPONENTE AUXILIAR: PriceInput (El input real)
// -------------------------------------------------------------

interface PriceInputProps {
  value: string;
  setValue: (v: string) => void;
  handleFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>, setter: (v: string) => void, min: number, max?: number) => void;
  min: number;
  max?: number;
}

const PriceInput: React.FC<PriceInputProps> = ({ value, setValue, handleFocus, handleBlur, min, max }) => (
    <div className="relative flex-1">
        <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-300">{CURRENCY_SYMBOL}</span>
        <input
      type="text" 
      placeholder="0.00"
      value={value}
      onChange={(e) => {
        let val = e.target.value;

        if (val === "") {
          setValue(val);
          return;
        }

        // 1. Normalizamos la coma a punto y preparamos para RegEx
        val = val.replace(/,/g, '.');

        // 2. LÓGICA CLAVE: Validación estricta para números y decimales
        const validPriceRegex = /^\d*\.?\d{0,2}$/;
        
        if (!validPriceRegex.test(val)) {
             return;
        }

        // 3. Validación de Min y Max
        const numVal = parseFloat(val);

        if (!isNaN(numVal)) {
            // Impedir ingresar un valor que de inmediato es mayor al max.
            if (max !== undefined && numVal > max) return;
            if (numVal < min) return;
        }
        
        // Seteamos el valor exacto que el usuario escribió (ej: "123." o "123.4")
        setValue(val);
      }}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown} // Aplica restricción numérica
      onBlur={(e) => {
        // Aquí sí formateamos con toFixed(2)
        handleBlur(e, setValue, min, max); 
        if (e.currentTarget.value) {
          let num = parseFloat(e.currentTarget.value.replace(/,/g, '.'));
          if (isNaN(num)) return; 

          // Aplicar límites
          if (max !== undefined && num > max) num = max;
          if (num < min) num = min; 
          
          // Formatear a 2 decimales
          setValue(num.toFixed(2));
        }
      }}
            className={`w-full pl-10 border border-gray-300 rounded p-2 dark:border-gray-600 dark:bg-gray-800 
                ${value === "" || parseFloat(value.replace(/,/g, '.') || '0') === 0 ? "text-gray-400 dark:text-gray-400" : "text-black dark:text-white"}`}
    />
  </div>
);

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL: PriceRangeInput
// -------------------------------------------------------------

interface PriceRangeInputProps {
  value: PriceRangeType | null; 
  onChange: (value: PriceRangeType | null) => void; 
  min?: number;
}

export const PriceRangeInput: React.FC<PriceRangeInputProps> = ({ value, onChange, min = 0 }) => {
  
  const [minValue, setMinValue] = useState(value?.min || "");
  const [maxValue, setMaxValue] = useState(value?.max || "");
  const [error, setError] = useState("");

  // Sincronización del estado local con el prop 'value'
  useEffect(() => {
    if (value === null) {
      setMinValue("");
      setMaxValue("");
    } else {
      setMinValue(value.min || "");
      setMaxValue(value.max || "");
    }
  }, [value]);
  
  // --- Handlers de UI ---

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.classList.remove("text-gray-400");
    e.currentTarget.classList.add("text-black");
  };

  // Handler principal de Blur (compartido por min y max)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, setter: (v: string) => void, min: number, max?: number) => {
    const numVal = parseFloat(e.currentTarget.value.replace(/,/g, '.') || '0');
    
    // Condición para limpiar a valor por defecto (si es vacío o menor al mínimo)
    if (!e.currentTarget.value || numVal < min) {
      e.currentTarget.classList.remove("text-black");
      e.currentTarget.classList.add("text-gray-400");
      setter(""); 
      return;
    }
    
    let num = parseFloat(e.currentTarget.value.replace(/,/g, '.'));
    if (isNaN(num)) return;
    
    // Aplicar límite max en el blur principal
    if (max !== undefined && num > max) num = max;

    if (num < min) num = min; 
    setter(num.toFixed(2));
  };

  // --- Lógica de Validación y Actualización ---

  const isRangeEmpty = (minVal: string, maxVal: string) => {
      return (!minVal && !maxVal) || (parseFloat(minVal.replace(/,/g, '.') || '0') === 0 && parseFloat(maxVal.replace(/,/g, '.') || '0') === 0);
  };
    
  const validate = (minVal: string, maxVal: string) => {
    const numMin = parseFloat(minVal.replace(/,/g, '.') || '0');
    const numMax = parseFloat(maxVal.replace(/,/g, '.') || '0');
    
    if (minVal && maxVal && numMin > 0 && numMax > 0 && numMax < numMin) {
      setError("El precio final no puede ser menor que el inicial.");
    } 
    // Validación del límite superior
    else if (numMax > MAX_PRICE_LIMIT && maxVal) {
        // 🛑 El mensaje de error ahora usa el límite de 5000
        setError(`El precio máximo no puede exceder ${CURRENCY_SYMBOL}${MAX_PRICE_LIMIT.toFixed(2)}.`);
    }
    else {
      setError("");
    }
  };
    
  const updateParent = (minVal: string, maxVal: string) => {
      if (isRangeEmpty(minVal, maxVal)) {
          onChange(null); 
      } else {
          onChange({ 
              min: minVal, 
              max: maxVal 
          });
      }
  }

  const handleChangeMin = (val: string) => {
    setMinValue(val);
    updateParent(val, maxValue);
    validate(val, maxValue);
  };

  const handleChangeMax = (val: string) => {
    setMaxValue(val);
    updateParent(minValue, val);
    validate(minValue, val);
  };
    
  const handleClearPrice = () => {
      setMinValue("");
      setMaxValue("");
      onChange(null); 
      setError("");
  };
    
  const isClearDisabled = isRangeEmpty(minValue, maxValue);
    
    return (
        <div className="mb-6 min-w-0">
            <h3 className="text-lg font-medium mb-2 flex justify-between items-center">
                <span>Rango de precios</span>
        
                <button
                        onClick={handleClearPrice}
                        disabled={isClearDisabled}
                        className={`text-xs font-medium px-2 py-1 rounded transition 
                            ${isClearDisabled 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-orange-800 bg-orange-100 border border-orange-700 hover:bg-orange-200 dark:text-orange-200 dark:bg-orange-900/20 dark:border-orange-600 dark:hover:bg-orange-800/20'
                            }`}
                >
                        Limpiar
                </button>
            </h3>
      
      <div className="flex gap-4">
        <PriceInput
          value={minValue} 
          setValue={handleChangeMin} 
          handleFocus={handleFocus}
          handleBlur={handleBlur}
          min={min}
          max={MAX_PRICE_LIMIT} // 🛑 Límite de 5000 aplicado al input min también (opcional pero seguro)
        />
        <PriceInput
          value={maxValue} 
          setValue={handleChangeMax} 
          handleFocus={handleFocus}
          handleBlur={handleBlur}
          min={min}
          max={MAX_PRICE_LIMIT} // Límite de 5000
        />
      </div>
      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
    </div>
  );
};