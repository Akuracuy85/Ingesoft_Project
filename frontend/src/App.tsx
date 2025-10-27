import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos"; // 👈 importa la página principal
import InformacionPersonal from "./pages/client/InformacionPersonal/InformacionPersonal.tsx";
import ColaVirtual from "./pages/client/Eventos/ColaVirtual.tsx";
import { Routes, Route } from "react-router-dom";

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
          <Route path="/cola" element={<ColaVirtual />} /> {/* 👈 aquí */}

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