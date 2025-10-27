import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos"; // 👈 importa la página principal
import InformacionPersonal from "./pages/client/InformacionPersonal/InformacionPersonal.tsx";
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
          {/* CLIENTE */}
          <Route path="/" element={<SeleccionDeEventos />} />
          <Route path="/evento/:id" element={<></>} />
          <Route path="/info" element={<InformacionPersonal />} />

          {/* ADMIN */}
          <Route path="/admin" element={<></>}>
            <Route path="/admin/ejemplo" element={<></>} />
          </Route>
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;