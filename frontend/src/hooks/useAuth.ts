// src/hooks/useAuth.ts
import AuthService from "@/services/AuthService";

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    return await AuthService.login({ email, password });
  };

  const logout = async () => {
    return await AuthService.logout();
  };

  const checkSession = async () => {
    return await AuthService.checkSession();
  };

  return { login, logout, checkSession };
};
