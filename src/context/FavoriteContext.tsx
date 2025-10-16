import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Destino {
  id: number;
  nombre: string;
  imagen: string;
  transporte: string[];
  actividades: string[];
}

interface Vuelo {
  id: number;
  origen: string;
  destino: Destino;
  fechahora_salida: string;
  fechahora_llegada: string;
  duracion: number;
  aerolinea: string;
  capacidad_restante: number;
  precio_por_persona: number;
  distancia_aproximada: number;
}

interface FavoritoCompleto {
  id: number;
  fecha_guardado: string;
  vuelo: Vuelo;
}

interface FavoritesContextType {
  favorites: FavoritoCompleto[]; // Ahora guarda objetos completos
  addFavorite: (flightId: number) => Promise<void>;
  removeFavorite: (flightId: number) => Promise<void>;
  isFavorite: (flightId: number) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoritoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get<{ data: FavoritoCompleto[] }>('/api/favorites', {
        withCredentials: true
      });
      
      console.log('Respuesta de favoritos:', response.data);

      // Guardar los objetos completos
      setFavorites(response.data.data || []);
      setLoading(false);
      
    } catch (error: any) {
      console.error('Error al cargar favoritos:', error);
      setFavorites([]);
      setLoading(false);
    }
  };

  const addFavorite = async (flightId: number) => {
    try {
      await axios.post('/api/favorites', { flight_id: flightId }, { withCredentials: true });
      // Recargar favoritos después de agregar
      await fetchFavorites();
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('Ya está en favoritos');
      } else {
        throw error;
      }
    }
  };

  const removeFavorite = async (flightId: number) => {
    try {
      await axios.delete(`/api/favorites/${flightId}`, { withCredentials: true });
      // Remover localmente
      setFavorites(prev => prev.filter(fav => fav.vuelo.id !== flightId));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  };

  const isFavorite = (flightId: number) => {
    return favorites.some(fav => fav.vuelo.id === flightId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }
  return context;
};