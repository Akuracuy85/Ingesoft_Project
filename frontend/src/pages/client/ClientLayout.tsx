// src/layouts/ClientLayout.tsx (LIMPIO Y FINAL)

import React from "react";
import type { ReactNode } from "react";
import { Header } from "../../components/client/Header/Header";
import { Footer } from "../../components/client/Footer/Footer";
import { type FiltersType } from "../../types/FiltersType";

interface ClientLayoutProps {
  children: ReactNode;
  showFilterButton?: boolean;
  onApplyNewFilters?: (filters: FiltersType) => void;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({
  children,
  showFilterButton = false,
  onApplyNewFilters,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      <header className="flex top-0 left-0 w-full z-50 bg-white shadow">
        <Header
          showFilterButton={showFilterButton}
          onApplyNewFilters={onApplyNewFilters}
        />
      </header>

      <main className="pt-[100px] flex-1 flex flex-col items-center justify-start w-full">
        {children}
      </main>

      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default ClientLayout;