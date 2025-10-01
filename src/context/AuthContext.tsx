// src/context/AuthContext.tsx
import { createContext, useState, useContext, useEffect, type ReactElement } from "react";
import axios from "axios";

type User = {
  email: string;
  id: number;
  nombre: string;
  apellido: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  existsToken: boolean;
  checkToken: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>({
    email: "dev@test.com",
    id: 1,
    nombre: "Mateo",
    apellido: "Medon"
  });
  const [existsToken, setExistsToken] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const login = (userData: User) => {
    setUser(userData);
    setExistsToken(true);
    
  };

  const logout = () => {
    setUser(null);
    setExistsToken(false);
    // También se podría hacer una llamada al backend para invalidar el token
    // axios.post('http://localhost:3000/api/auth/logout', {}, {withCredentials: true});
  };

  const checkToken = async () => {
    try {
      setLoading(true);
      const response = await axios.post<User>('http://localhost:3000/api/cliente/verify', {}, { 
        withCredentials: true,
        timeout: 5000
      });
      
      if (response.status === 200 && response.data) {
        setExistsToken(true);
        setUser({
          email: response.data.email,
          id: response.data.id,
          nombre: response.data.nombre,
          apellido: response.data.apellido,
        });
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      setExistsToken(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verificar token al cargar la aplicación
//  useEffect(() => {
//    checkToken();
//  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    existsToken,
    checkToken,
    isAuthenticated: existsToken && user !== null,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

export { useAuth };
export default useAuth;