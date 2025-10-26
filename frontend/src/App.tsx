import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos"; // 👈 importa la página principal
import { Routes, Route } from "react-router-dom";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SeleccionDeEventos />} />
          <Route path="/evento/:id" element={<></>} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;