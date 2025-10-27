import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

// 1. AÑADE esta importación (la tenías en el primer ejemplo)
import CompraDeEntradas from "./pages/client/CompraDeEntradas"; 

import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos";
import InformacionPersonal from "./pages/client/InformacionPersonal/InformacionPersonal.tsx";
// Aquí importarías las páginas de Admin cuando las tengas

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* === CLIENTE === */}
          <Route path="/" element={<SeleccionDeEventos />} />
          
          {/* 2. USA el componente aquí en lugar de <></> */}
          <Route path="/evento/:id" element={<CompraDeEntradas />} />
          
          <Route path="/info" element={<InformacionPersonal />} />

          {/* === ADMIN === */}
          <Route path="/admin" element={<></>}>
            {/* 3. CORRECCIÓN: La ruta anidada no lleva el path del padre */}
            <Route path="ejemplo" element={<></>} />
          </Route>
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;