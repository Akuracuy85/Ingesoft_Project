import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

// 1. Importa TODAS las páginas que vas a usar
import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos";
import CompraDeEntradas from "./pages/client/CompraDeEntradas"; // 👈 Esta faltaba en tu versión
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
          
          {/* 2. Usa el componente correcto aquí en lugar de <></> */}
          <Route path="/evento/:id" element={<CompraDeEntradas />} />
          
          <Route path="/info" element={<InformacionPersonal />} />

          {/* === ADMIN === */}
          {/* Puedes dejar 'element' vacío si /admin es solo un agrupador */}
          <Route path="/admin"> 
            {/* Ejemplo: <Route index element={<AdminDashboard />} /> */}
            <Route path="ejemplo" element={<></>} /> 
            {/* Nota: las rutas anidadas no llevan el / inicial */}
          </Route>
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;