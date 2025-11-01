// src/hooks/useAuth.tsx
import React, { 
  createContext, 
  useState, 
  useContext, 
  type ReactNode, 
  useEffect 
} from "react";
// Usamos los tipos que ya tienes
import { type User } from "@/models/User"; 
// Asumimos que AuthService está en la ruta correcta
import AuthService from "@/services/AuthService"; 

// 1. Define la forma del contexto
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean; // Para saber si está verificando la sesión
  login: (email: string, pass: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

// 2. Crea el Contexto
// No lo exportamos, es un detalle interno de este archivo
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. (IMPORTANTE) Crea y EXPORTA el Proveedor
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empieza en true
  const isLoggedIn = !!user; // true si 'user' existe, false si es 'null'

  // Función interna para cargar el perfil del usuario
  const fetchProfile = async () => {
    try {
      // Llama al método del servicio
      const userData = await AuthService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("No se pudo cargar el perfil:", error);
      setUser(null); // Desloguea si hay error
    }
  };

  // Función 'checkSession' que SÍ actualiza el estado
  const checkSession = async () => {
    setIsLoading(true);
    try {
      const res = await AuthService.checkSession();
      if (res.success) {
        // Si la sesión es válida, trae los datos del perfil
        await fetchProfile();
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Se ejecuta 1 VEZ al cargar la app para verificar la cookie
  useEffect(() => {
    checkSession();
  }, []); // El array vacío [] asegura que solo se ejecute al montar

  
  // --- Esta es la función que tu Login.tsx usará ---
  const login = async (email: string, password: string) => {
    try {
      // 1. Llama al servicio
      const res = await AuthService.login({ email, password });

      if (res.success) {
        // 2. Si tiene éxito, carga el perfil para actualizar el estado
        await fetchProfile(); 
      }
      
      return res;

    } catch (error: any) {
      console.error("Error en login (Context):", error);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // 4. Limpia el estado del usuario pase lo que pase
      setUser(null); 
    }
  };

  // 5. Valores que se exponen a toda la app
  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 6. (IMPORTANTE) EXPORTA el Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};