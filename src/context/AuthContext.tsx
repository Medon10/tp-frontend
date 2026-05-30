import { createContext, useState, useContext, useEffect, type ReactElement } from "react";
import { api } from "../services/api";
import type { User } from "../types";

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
};

  const logout = () => {
    setUser(null);
    setToken(null);
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