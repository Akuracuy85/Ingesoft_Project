import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Loading from '@/components/common/Loading';


const ProtectedRoute: React.FC = () => {
  const { isLoggedIn, isLoading } = useAuth();

  // Mientras se verifica la sesión
  if (isLoading) {
    return <Loading fullScreen message={"Cargando..."} />;
  }

  // Si no está logueado → redirige a /login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado → renderiza la página protegida
  return <Outlet />;
};

export default ProtectedRoute;
