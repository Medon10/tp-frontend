import { createContext, useState, useContext, useEffect, type ReactElement } from "react";
import axios from "axios";

type User = {
  email: string;
  id: number;
  nombre: string;
  apellido: string;
  rol: 'cliente' | 'admin';
};

type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState<boolean>(true); 

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Llamar al backend para limpiar la cookie
      await axios.post('/api/users/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/profile/me', { 
        withCredentials: true,
        timeout: 5000
      });
      
      const data = response.data as { data: User };
      if (response.status === 200 && data.data) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: user !== null,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};