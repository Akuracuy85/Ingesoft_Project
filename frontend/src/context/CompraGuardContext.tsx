import { createContext, useState, useContext } from "react";

interface CompraGuardContextType {
  isCompraActive: boolean;
  colaId?: number; // ✅ guarda el ID de la cola
  setIsCompraActive: (value: boolean, colaId?: number) => void; // 🔹 colaId opcional
  pendingNavigation: (() => void) | null;
  setPendingNavigation: (fn: (() => void) | null) => void;
}

const CompraGuardContext = createContext<CompraGuardContextType>({
  isCompraActive: false,
  setIsCompraActive: () => {},
  pendingNavigation: null,
  setPendingNavigation: () => {},
  colaId: undefined,
});

export const useCompraGuard = () => useContext(CompraGuardContext);

export const CompraGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCompraActiveState, setIsCompraActiveState] = useState(false);
  const [colaId, setColaId] = useState<number | undefined>(undefined);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Función para actualizar ambos valores: isCompraActive y colaId
  const setIsCompraActive = (value: boolean, id?: number) => {
    setIsCompraActiveState(value);
    setColaId(id);
  };

  return (
    <CompraGuardContext.Provider
      value={{
        isCompraActive: isCompraActiveState,
        colaId,
        setIsCompraActive,
        pendingNavigation,
        setPendingNavigation,
      }}
    >
      {children}
    </CompraGuardContext.Provider>
  );
};

export default CompraGuardContext;