import { CustomDropdown } from "../../CustomDropdown";
import { locationsMock } from "../../../data/locationsMock";
import type { LocationType, Option } from "../../../types/LocationType";

type LocationSelectProps = {
  value: LocationType;
  onChange: (value: LocationType) => void;
};

export const LocationSelect = ({ value, onChange }: LocationSelectProps) => {
  const { departamento, provincia, distrito } = value;

  const withTodos = (options: Option[]) => [{ id: "", nombre: "Todos" }, ...options];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Ubicación</h3>
      <div className="grid grid-cols-3 gap-4">

        {/* Departamento */}
        <CustomDropdown
          options={withTodos(locationsMock.departamentos)}
          value={departamento || ""}
          onChange={(id) => {
            onChange({ departamento: id || null, provincia: null, distrito: null });
          }}
        />

        {/* Provincia */}
        <CustomDropdown
          options={withTodos(
            locationsMock.departamentos.find(d => d.id === departamento)?.provincias || []
          )}
          value={provincia || ""}
          onChange={(id) => {
            onChange({ departamento, provincia: id || null, distrito: null });
          }}
          disabled={!departamento}
        />

        {/* Distrito */}
        <CustomDropdown
          options={withTodos(
            locationsMock.departamentos
              .find(d => d.id === departamento)
              ?.provincias.find(p => p.id === provincia)?.distritos || []
          )}
          value={distrito || ""}
          onChange={(id) => {
            onChange({ departamento, provincia, distrito: id || null });
          }}
          disabled={!provincia}
        />
      </div>
    </div>
  );
};