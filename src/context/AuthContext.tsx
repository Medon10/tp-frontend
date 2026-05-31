import { createContext, useState, useContext, useEffect, type ReactElement } from "react";
import { api } from "../services/api";
import type { User } from "../types";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  loginLoading: boolean;
  loginError: string | null;
  updateUserContext: (updatedUser: User) => void;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      interface LoginResponse {
        user?: User;
        message?: string;
        token?: string;
      }

      const response = await api.post<LoginResponse>(
        '/users/login',
        {
          email,
          password
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        if (response.data.token) {
          try {
            localStorage.setItem('auth_token', response.data.token);
          } catch {}
          setToken(response.data.token);
        }
        return;
      }

      setLoginError(response.data.message || 'Error de autenticación.');
    } catch (error: any) {
      console.error('Error en login:', error);

      if (error.code === 'ECONNABORTED') {
        setLoginError('La conexión tardó demasiado. Intenta de nuevo.');
      } else if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        switch (status) {
          case 400:
            setLoginError(serverMessage || 'Datos de entrada inválidos.');
            break;
          case 401:
            setLoginError('Email o contraseña incorrectos.');
            break;
          case 404:
            setLoginError('Usuario no encontrado.');
            break;
          case 429:
            setLoginError('Demasiados intentos. Intenta más tarde.');
            break;
          case 500:
            setLoginError('Error del servidor. Intenta más tarde.');
            break;
          default:
            setLoginError(serverMessage || 'Error de autenticación.');
        }
      } else if (error.request) {
        setLoginError('Sin conexión al servidor. Verifica la conexión a internet y al servidor.');
      } else {
        setLoginError('Error inesperado. Intenta de nuevo.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoginError(null);
    localStorage.removeItem('auth_token');
  };

const checkAuth = async () => {
  try {
    setLoading(true);
    const response = await api.get<{ data: User }>('/users/profile/me', { 
      timeout: 5000
    });
    if (response.data?.data) {
      setUser(response.data.data);
    }
  } catch {
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
    // ya no setea ni borra header aca, centralizado en api.ts
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: user !== null,
    loading,
    loginLoading,
    loginError,
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