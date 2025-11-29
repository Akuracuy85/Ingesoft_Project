import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos";
import { Login } from "@/pages/auth/Login";
import { RestablecerContraseña } from "@/pages/auth/RestablecerContraseña";
import { NuevaContraseña } from "@/pages/auth/NuevaContraseña";
import { Registro } from "@/pages/auth/Registro";
import { RegistroOrganizador } from "@/pages/auth/RegistroOrganizador";
import Error404 from "@/pages/Error404";
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

// Solo ADMIN
const OnlyAdmin = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/eventos" replace />;
  }

  // Si es organizador
  if (user?.rol === "ORGANIZADOR") {
    return <Navigate to="/organizador/eventos" replace />;
  }

  // Si es cliente
  if (user?.rol === "CLIENTE") {
    return <Navigate to="/eventos" replace />;
  }

  // Si es admin: acceso permitido
  return children;
};


// ADMIN u ORGANIZADOR (acceso prohibido solo para CLIENTE)
const OnlyAdminOrOrganizador = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/eventos" replace />;

  if (user?.rol === "CLIENTE") {
    return <Navigate to="/eventos" replace />;
  }

  // Admin = OK, Organizador = OK
  return children;
};

/* =====================================================
   APP PRINCIPAL
   ===================================================== */

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

          <Routes>

            {/* ============================
              RUTAS PÚBLICAS
            ============================ */}
            <Route path="/" element={<Navigate to="/eventos" replace />} />
            <Route path="/login" element={<Login />} />
            {/*<Route path="/restablecer" element={<RestablecerContraseña />} />*/}
            {/*<Route path="/nueva-contraseña" element={<NuevaContraseña />} />*/}
            <Route path="/registro" element={<Registro />} />
            <Route path="/organizador/registro" element={<RegistroOrganizador />} />
            <Route path="/eventos" element={<SeleccionDeEventos />} />
            <Route path="/404" element={<Error404 />} />
            <Route path="/eventos/:id/detalle" element={<DetalleEvento />} />

            {/* ============================
              RUTAS PROTEGIDAS (todos los roles autenticados)
            ============================ */}
            <Route element={<ProtectedRoute />}>

              {/* CLIENTE (los organizadores y admin también pueden verlas) */}
              <Route path="/perfil" element={<InformacionPersonal />} />
              <Route path="/eventos/:id/compra" element={<CompraDeEntradas />} />
              <Route path="/cola" element={<ColaVirtual />} />
              <Route path="/compra-exitosa" element={<CompraExitosa />} />
              <Route path="/info" element={<InformacionPersonal />} />

              {/* ORGANIZADOR (clientes NO pueden entrar) */}
              <Route
                path="/organizador/eventos"
                element={
                  <OnlyAdminOrOrganizador>
                    <GestionEventos />
                  </OnlyAdminOrOrganizador>
                }
              />

              {/* ADMIN (solo admin puede entrar) */}
              <Route
                path="/admin/usuarios"
                element={
                  <OnlyAdmin>
                    <AdminUsuarios />
                  </OnlyAdmin>
                }
              />

              <Route
                path="/admin/eventos"
                element={
                  <OnlyAdmin>
                    <AdminEventos />
                  </OnlyAdmin>
                }
              />

              <Route
                path="/admin/reportes"
                element={
                  <OnlyAdmin>
                    <AdminReportes />
                  </OnlyAdmin>
                }
              />

              <Route
                path="/admin/terminos"
                element={
                  <OnlyAdmin>
                    <TerminosCondiciones />
                  </OnlyAdmin>
                }
              />

            </Route>

            <Route path="*" element={<Error404 />} />

          </Routes>

        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
