import { createContext, useState, useContext, useEffect, type ReactElement } from "react";
import { api } from "../services/api";

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
  updateUserContext: (updatedUser: User) => void;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    try {
      const saved = localStorage.getItem('auth_token');
      if (saved) {
        setToken(saved);
        api.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
      }
    } catch {}
  };

  const logout = async () => {
    try {
      // Llamar al backend para limpiar la cookie
  await api.post('/users/logout', {});
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    }
  };

const checkAuth = async () => {
  try {
    setLoading(true);
    const response = await api.get<{ data: User }>('/users/profile/me', { 
      timeout: 5000
    });
    
    if (response.status === 200 && response.data?.data) {
      setUser(response.data.data);
    } else {
      // Si falla la cookie pero tenemos token almacenado, intentar obtener perfil usando bearer
      if (!response.data?.data && !user && token) {
        // Perfil ya intentado, nada más
      }
    }
  } catch (error: any) {
    // Silenciar error 401 (no autenticado es normal)
    if (error.response?.status === 401) {
      console.log('Usuario no autenticado (normal)');
    } else {
      console.error('Error verificando autenticación:', error);
    }
    setUser(null);
  } finally {
    setLoading(false);
  }
};

const updateUserContext = (updatedUser: User) => {
  setUser(updatedUser);
};

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
    // Al montar, si hay token, configurar header Authorization
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: user !== null,
    loading,
    updateUserContext,
    token
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