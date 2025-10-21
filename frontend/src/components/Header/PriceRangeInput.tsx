import React, { useState } from "react";

const PriceInput = ({ value, setValue, handleFocus, handleBlur }: any) => (
  <div className="relative flex-1">
    <span className="absolute left-3 top-2 text-gray-500">S/.</span>
    <input
      type="number"
      placeholder="0.00"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={handleFocus}
      onBlur={(e) => handleBlur(e, setValue)}
      className="w-full pl-10 border border-gray-300 rounded p-2 text-gray-400"
    />
  </div>
);

export const PriceRangeInput = () => {
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.classList.remove("text-gray-400");
    e.currentTarget.classList.add("text-black");
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, setter: (v: string) => void) => {
    if (!e.currentTarget.value) {
      e.currentTarget.classList.remove("text-black");
      e.currentTarget.classList.add("text-gray-400");
    }
    setter(e.currentTarget.value);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Rango de precios</h3>
      <div className="flex gap-4">
        <PriceInput
          value={fromValue}
          setValue={setFromValue}
          handleFocus={handleFocus}
          handleBlur={handleBlur}
        />
        <PriceInput
          value={toValue}
          setValue={setToValue}
          handleFocus={handleFocus}
          handleBlur={handleBlur}
        />
      </div>
    </div>
  );

}