import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos";
import { Login } from "@/pages/auth/Login";
import { RestablecerContraseña } from "@/pages/auth/RestablecerContraseña";
import { NuevaContraseña } from "@/pages/auth/NuevaContraseña";
import { Registro } from "@/pages/auth/Registro";
import { RegistroOrganizador } from "@/pages/auth/RegistroOrganizador";
import Error404 from "@/components/Error404";
import ColaVirtual from "./pages/client/Eventos/ColaVirtual";
import CompraDeEntradas from "./pages/client/CompraDeEntradas";
import InformacionPersonal from "./pages/client/InformacionPersonal/InformacionPersonal";
import AdminUsuarios from "./pages/admin/Usuarios/AdminUsuarios";
import AdminEventos from "./pages/admin/Eventos/AdminEventos";
import AdminReportes from "./pages/admin/Reportes/AdminReportes";
import DetalleEvento from "./pages/client/DetalleEvento";
import GestionEventos from "./pages/organizador/eventos/GestionEventos";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CompraExitosa from "./pages/client/Eventos/CompraExitosa";
import TerminosCondiciones from "./pages/admin/Terminos/TerminosYCondiciones";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Navigate to="/eventos" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/restablecer" element={<RestablecerContraseña />} />
            <Route path="/nueva-contraseña" element={<NuevaContraseña />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/organizador/registro" element={<RegistroOrganizador />} />
            <Route path="/eventos" element={<SeleccionDeEventos />} />
            <Route path="/404" element={<Error404 />} />
            <Route path="/eventos/:id/detalle" element={<DetalleEvento />} />

            {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<InformacionPersonal />} />
            <Route path="/eventos/:id/compra" element={<CompraDeEntradas />} />
            <Route path="/cola" element={<ColaVirtual />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/eventos" element={<AdminEventos />} />
            <Route path="/admin/reportes" element={<AdminReportes />} />
            <Route path="/admin/terminos" element={<TerminosCondiciones />} />
            <Route path="/organizador/eventos" element={<GestionEventos />} />
            <Route path="/info" element={<InformacionPersonal />} />
            <Route path="/compra-exitosa" element={<CompraExitosa />} />
          </Route>

          {/* Catch-all: mostrar Error404 en rutas no encontradas */}
          <Route path="*" element={<Error404 />} />
          {/*<Route path="/*" element={<Login />} />*/}
          </Routes>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;