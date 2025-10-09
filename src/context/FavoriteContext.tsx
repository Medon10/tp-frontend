import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: number[]; // IDs de vuelos favoritos
  addFavorite: (flightId: number) => Promise<void>;
  removeFavorite: (flightId: number) => Promise<void>;
  isFavorite: (flightId: number) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
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
      const response = await axios.get('/api/favorites', { withCredentials: true });
      const data = response.data as { data: { flight: { id: number } }[] };
      const favoriteIds = data.data.map((fav: any) => fav.flight.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (flightId: number) => {
    try {
      await axios.post('/api/favorites', { flight_id: flightId }, { withCredentials: true });
      setFavorites(prev => [...prev, flightId]);
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
      setFavorites(prev => prev.filter(id => id !== flightId));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  };

  const isFavorite = (flightId: number) => {
    return favorites.includes(flightId);
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