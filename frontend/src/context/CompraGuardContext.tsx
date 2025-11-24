import { createContext, useState, useContext } from "react";

interface CompraGuardContextType {
  isCompraActive: boolean;
  setIsCompraActive: (value: boolean) => void;
  pendingNavigation: (() => void) | null;
  setPendingNavigation: (fn: (() => void) | null) => void;
}

const CompraGuardContext = createContext<CompraGuardContextType>({
  isCompraActive: false,
  setIsCompraActive: () => {},
  pendingNavigation: null,
  setPendingNavigation: () => {},
});

export const useCompraGuard = () => useContext(CompraGuardContext);

export const CompraGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCompraActive, setIsCompraActive] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  return (
    <CompraGuardContext.Provider
      value={{ isCompraActive, setIsCompraActive, pendingNavigation, setPendingNavigation }}
    >
      {children}
    </CompraGuardContext.Provider>
  );
};

export default CompraGuardContext;
