import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export interface Destino {
  id: number;
  nombre: string;
  transporte: string[];
  actividades: string[];
  imagen: string;
}

export interface Vuelo {
  id: number;
  aerolinea: string;
  origen: string;
  destino: Destino;
  fechahora_salida: string;
  fechahora_llegada: string;
  montoVuelo: number;
  cantidad_asientos: number;
  duracion: number;
  capacidad_restante?: number;
}

interface FavoritesContextType {
  favorites: Vuelo[];
  addFavorite: (flightId: number) => Promise<void>;
  removeFavorite: (flightId: number) => Promise<void>;
  isFavorite: (flightId: number) => boolean;
  loading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Vuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ data: Vuelo[] }>('/api/favorites', { withCredentials: true });
      const rawData = response.data.data || [];
      
      if (rawData.length > 0 && rawData[0] && (rawData[0] as any).flight) {
        const extractedFlights = rawData.map((fav: any) => fav.flight).filter(Boolean);
        setFavorites(extractedFlights);
      } else {
        setFavorites(rawData as Vuelo[]);
      }
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
      setError('No se pudieron cargar los favoritos.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchFavorites]);

  const addFavorite = useCallback(async (flightId: number) => {
    try {
      await axios.post('/api/favorites', { flight_id: flightId }, { withCredentials: true });
      await fetchFavorites();
    } catch (error: any) {
      console.error('Error al agregar favorito:', error);
      throw error;
    }
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (flightId: number) => {
    try {
      await axios.delete(`/api/favorites/${flightId}`, { withCredentials: true });
      setFavorites(prev => prev.filter(flight => flight.id !== flightId));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      await fetchFavorites();
      throw error;
    }
  }, [fetchFavorites]);

  const isFavorite = useCallback((flightId: number) => {
    return favorites.some(flight => flight.id === flightId);
  }, [favorites]);

  const value = useMemo(() => ({
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    loading,
    error,
    fetchFavorites,
  }), [favorites, addFavorite, removeFavorite, isFavorite, loading, error, fetchFavorites]);

  return (
    <FavoritesContext.Provider value={value}>
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