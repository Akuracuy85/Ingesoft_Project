// src/layouts/ClientLayout.tsx (CORREGIDO)

import React from "react";
import type { ReactNode } from "react";
import { Header } from "../../components/client/Header/Header";
import { Footer } from "../../components/client/Footer/Footer";
// 🛑 IMPORTAR EL FILTER PROVIDER
import { FilterProvider } from "../../context/FilterContext"; // Asegúrate de que la ruta sea correcta

// 1. Añadimos la prop a la interfaz del Layout
interface ClientLayoutProps {
  children: ReactNode;
  showFilterButton?: boolean;
}

// 2. Recibimos la prop
const ClientLayout: React.FC<ClientLayoutProps> = ({
  children,
  showFilterButton = false,
}) => {
  return (
    // 🛑 ENVOLVER TODO EL CONTENIDO CON EL FILTERPROVIDER
    <FilterProvider>
      <div className="flex flex-col min-h-screen bg-white">
        
        <header className="flex top-0 left-0 w-full z-50 bg-white shadow">
          <Header showFilterButton={showFilterButton} />
        </header>

        <main className="pt-[100px] flex-1 flex flex-col items-center justify-start w-full">
          {children}
        </main>

        <footer className="w-full">
          <Footer />
        </footer>
      </div>
    </FilterProvider>
  );
};

export default ClientLayout;