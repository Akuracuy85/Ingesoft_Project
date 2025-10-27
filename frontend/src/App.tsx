import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

// 1. Importa AMBAS páginas
// Se ajustan las rutas para que suban un nivel (../)
import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos";
// Asegúrate de que la ruta de importación sea correcta
import CompraDeEntradas from "./pages/client/CompraDeEntradas"; 

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Ruta principal: Muestra la lista de eventos */}
          <Route path="/" element={<SeleccionDeEventos />} />
          
          {/* Ruta de detalle: Muestra la compra de tickets para UN evento */}
          <Route path="/evento/:id" element={<CompraDeEntradas />} />

          {/* Aquí puedes agregar más rutas, como /login, /perfil, etc. */}
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;