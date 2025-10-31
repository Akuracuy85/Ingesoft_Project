import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos"; 
import { Login } from "@/pages/auth/Login";
import { RestablecerContraseña } from "@/pages/auth/RestablecerContraseña";
import { NuevaContraseña } from "@/pages/auth/NuevaContraseña";
import { Registro } from "@/pages/auth/Registro";
import { Routes, Route, Navigate } from "react-router-dom";
import ColaVirtual from "./pages/client/Eventos/ColaVirtual.tsx";
import CompraDeEntradas from "./pages/client/CompraDeEntradas"; 
import InformacionPersonal from "./pages/client/InformacionPersonal/InformacionPersonal.tsx";
import AdminUsuarios from "./pages/admin/Usuarios/AdminUsuarios";
import DetalleEvento from "./pages/client/Eventos/DetalleEvento";
import { RegistroOrganizador } from "@/pages/auth/RegistroOrganizador";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* === CLIENTE === */}
          <Route path="/" element={<Navigate to="/eventos" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restablecer" element={<RestablecerContraseña />} />
          <Route path="/nueva-contraseña" element={<NuevaContraseña />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro-organizador" element={<RegistroOrganizador />} />
          
          {/* 2. USA el componente aquí en lugar de <></> */}
          <Route path="/eventos/evento/:id" element={<CompraDeEntradas />} />
          <Route path="/eventos" element={<SeleccionDeEventos />} />
          <Route path="/eventos/:id/detalle" element={<DetalleEvento />} />
          
          <Route path="/info" element={<InformacionPersonal />} />
          <Route path="/cola" element={<ColaVirtual />} /> {/* 👈 aquí */}

          {/* === ADMIN === */}
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />

        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;