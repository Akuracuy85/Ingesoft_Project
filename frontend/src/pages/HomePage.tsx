import { Header } from "../components/Header/Header";
import { Body } from "../components/Body/Body";
import { Footer } from "../components/Footer/Footer";

export const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER — fijo arriba */}
      <header className="flex top-0 left-0 w-full z-50 bg-white shadow">
        <Header />
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        <Body />
      </main>

      {/* FOOTER — pegado al fondo */}
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};