import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos"; 
import { Login } from "@/pages/auth/Login";
import { RestablecerContraseña } from "@/pages/auth/RestablecerContraseña";
import { NuevaContraseña } from "@/pages/auth/NuevaContraseña";
import { Registro } from "@/pages/auth/Registro";
import { Routes, Route, Navigate } from "react-router-dom";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restablecer" element={<RestablecerContraseña />} />
          <Route path="/nueva-contraseña" element={<NuevaContraseña />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<SeleccionDeEventos />} />
          <Route path="/evento/:id" element={<></>} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;
