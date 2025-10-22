import { PriceRangeInput } from "./Filters/PriceRangeInput";
import { LocationSelect } from "./Filters/LocationSelect";
import { MultiSelectDropdown } from "./Filters/MultiSelectDropdown";
import { DateRangePicker } from "./Filters/DateRangePicker";

export const FilterModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* 🔹 Contenedor principal con reglas de cursor y selección */}
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative select-none"
        style={{
          cursor: "default",
        }}
      >
        <style>{`
          /* 🔹 Afecta solo dentro de este modal */
          .modal-root * {
            cursor: default !important;
            user-select: none !important;
          }

          .modal-root input,
          .modal-root textarea {
            cursor: text !important;
            user-select: text !important;
          }

          .modal-root button,
          .modal-root select,
          .modal-root [role="button"],
          .modal-root .clickable,
          .modal-root input[type="checkbox"],
          .modal-root input[type="radio"] {
            cursor: pointer !important;
            user-select: none !important;
          }
        `}</style>

        <div className="modal-root">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-4">Filtros</h2>

          {/* 🔹 Campos individuales */}
          <PriceRangeInput />
          <LocationSelect />
          <MultiSelectDropdown
            label="Categoría"
            options={["Rock", "Pop", "Reggaetón", "Salsa", "Jazz"]}
          />
          <MultiSelectDropdown
            label="Artista"
            options={["Bad Bunny", "Ariana Grande", "Coldplay", "Shakira"]}
          />
          <DateRangePicker />

          <div className="flex justify-end mt-6">
            <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};