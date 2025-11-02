import React from "react";
import type { ReactNode } from "react";
import { Header } from "../../components/client/Header/Header";
import { Footer } from "../../components/client/Footer/Footer";

// 1. Añadimos la prop a la interfaz del Layout
interface ClientLayoutProps {
  children: ReactNode;
  showFilterButton?: boolean; // <-- AÑADIDO: Prop opcional
}

// 2. Recibimos la prop (con valor por defecto 'false')
const ClientLayout: React.FC<ClientLayoutProps> = ({
  children,
  showFilterButton = false, // <-- AÑADIDO
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* 3. Pasamos la prop hacia el Header */}
      <header className="flex top-0 left-0 w-full z-50 bg-white shadow">
        <Header showFilterButton={showFilterButton} /> {/* <-- MODIFICADO */}
      </header>

      {/* CONTENIDO PRINCIPAL — Aquí se inyecta la página */}
      <main className="pt-[100px] flex-1 flex flex-col items-center justify-start w-full">
        {children}
      </main>

      {/* FOOTER — pegado al fondo */}
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default ClientLayout;