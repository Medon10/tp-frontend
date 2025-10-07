import './Favoritos.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoriteContext';

interface Destino {
  id: number;
  nombre: string;
  transporte: string[];
  actividades: string[];
  imagen: string;
}

interface Vuelo {
  id: number;
  fechahora_salida: string;
  fechahora_llegada: string;
  duracion: number;
  aerolinea: string;
  cantidad_asientos: number;
  montoVuelo: number;
  origen: string;
  destino: Destino;
  destino_id?: number; // Por si viene el ID directo
}

export const Favoritos: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favorites, removeFavorite, loading: favoritesLoading } = useFavorites();
  
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchFavoriteFlights();
  }, [isAuthenticated]);

  const fetchFavoriteFlights = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Obtenemos los favoritos con toda la información desde el endpoint
      const response = await axios.get('/api/favorites');
      const data = response.data as { data: { flight: Vuelo }[] };
      
      // Extraemos los vuelos completos
      const vuelosData = data.data.map((fav: any) => fav.flight);
      console.log('Vuelos favoritos:', vuelosData); // Debug
      setVuelos(vuelosData);
    } catch (error: any) {
      console.error('Error al cargar vuelos favoritos:', error);
      setError('No se pudieron cargar tus vuelos favoritos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (flightId: number) => {
    try {
      await removeFavorite(flightId);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar de favoritos');
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatearHora = (fecha: string): string => {
    return new Date(fecha).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearDuracion = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  if (isLoading || favoritesLoading) {
    return (
      <main className="favoritos-page">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando tus favoritos...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="favoritos-page">
        <div className="container">
          <div className="error-container">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchFavoriteFlights}>
              Intentar de nuevo
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="favoritos-page">
      <div className="container">
        <div className="favoritos-header">
          <div>
            <h1>
              <i className="fas fa-heart"></i>
              Mis Favoritos
            </h1>
            <p className="favoritos-subtitle">
              {vuelos.length === 0 
                ? 'Aún no has guardado ningún vuelo favorito'
                : `${vuelos.length} ${vuelos.length === 1 ? 'vuelo guardado' : 'vuelos guardados'}`
              }
            </p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/destinos')}>
            <i className="fas fa-search"></i>
            Buscar vuelos
          </button>
        </div>

        {vuelos.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-icon">
              <i className="far fa-heart"></i>
            </div>
            <h2>No tienes vuelos favoritos</h2>
            <p>Explora nuestros destinos y guarda tus vuelos preferidos para encontrarlos fácilmente más tarde.</p>
            <button className="btn btn-primary" onClick={() => navigate('/destinos')}>
              <i className="fas fa-plane-departure"></i>
              Explorar destinos
            </button>
          </div>
        ) : (
          <div className="favoritos-grid">
            {vuelos.map((vuelo) => (
              <article key={vuelo.id} className="favorito-card">
                <div className="favorito-header">
                  <div className="aerolinea">
                    <i className="fas fa-plane"></i>
                    <span>{vuelo.aerolinea}</span>
                  </div>
                  <button 
                    className="btn-remove-favorite"
                    onClick={() => handleRemoveFavorite(vuelo.id)}
                    aria-label="Quitar de favoritos"
                  >
                    <i className="fas fa-heart"></i>
                  </button>
                </div>

                <div className="favorito-ruta">
                  <div className="origen">
                    <span className="ciudad">{vuelo.origen}</span>
                    <span className="hora">{formatearHora(vuelo.fechahora_salida)}</span>
                    <span className="fecha">{formatearFecha(vuelo.fechahora_salida)}</span>
                  </div>

                  <div className="duracion">
                    <i className="fas fa-arrow-right"></i>
                    <span>{formatearDuracion(vuelo.duracion)}</span>
                  </div>

                  <div className="destino">
                    <span className="ciudad">{vuelo.destino?.nombre || 'Destino'}</span>
                    <span className="hora">{formatearHora(vuelo.fechahora_llegada)}</span>
                    <span className="fecha">{formatearFecha(vuelo.fechahora_llegada)}</span>
                  </div>
                </div>

                <div className="favorito-info">
                  <div className="info-item">
                    <i className="fas fa-users"></i>
                    <span>{vuelo.cantidad_asientos} asientos</span>
                  </div>
                  {vuelo.destino?.actividades && vuelo.destino.actividades.length > 0 && (
                    <div className="info-item">
                      <i className="fas fa-map-marked-alt"></i>
                      <span>{vuelo.destino.actividades[0]}</span>
                    </div>
                  )}
                </div>

                <div className="favorito-footer">
                  <div className="precio">
                    <span className="precio-label">Desde</span>
                    <span className="precio-valor">${vuelo.montoVuelo.toLocaleString()}</span>
                    <span className="precio-moneda">USD</span>
                  </div>
                  <div className="footer-actions">
                    <button 
                      className="btn btn-outline"
                      onClick={() => {
                        const destinoId = vuelo.destino?.id || vuelo.destino_id;
                        console.log('Navegando a destino:', destinoId); // Debug
                        if (destinoId) {
                          navigate(`/destinos/${destinoId}`);
                        } else {
                          alert('No se pudo encontrar el ID del destino');
                        }
                      }}
                    >
                      Ver destino
                    </button>
                    <button className="btn btn-primary">
                      Reservar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};