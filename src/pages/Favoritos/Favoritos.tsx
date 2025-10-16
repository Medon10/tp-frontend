import './Favoritos.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoriteContext';
import { Notification } from '../../components/layout/Notification';
import type { Vuelo } from '../Admin/types'; // Importación de tipo correcta

export const Favoritos: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { favorites: vuelos, removeFavorite, loading, error, fetchFavorites } = useFavorites();

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleReserve = async (vuelo: Vuelo, personas: number) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (personas <= 0) {
      setNotification({ message: 'Debe seleccionar al menos 1 pasajero.', type: 'error' });
      return;
    }
    try {
      const response = await axios.post<{ message: string }>('/api/reservations', {
        flight_id: vuelo.id,
        personas: personas,
      }, { withCredentials: true });
      setNotification({ message: response.data.message, type: 'success' });
      fetchFavorites();
    } catch (err: any) {
      setNotification({ message: err.response?.data?.message || 'Error al procesar la reserva.', type: 'error' });
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatearHora = (fecha: string): string => {
    return new Date(fecha).toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatearDuracion = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  if (loading) {
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
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Intentar de nuevo
            </button>
          </div>
        </div>
      </main>
    );
  }

  function FavoritoCard({ vuelo }: { vuelo: Vuelo }) {
    const [personas, setPersonas] = useState(1);

    const handleRemoveFavorite = async (flightId: number) => {
      try {
        await removeFavorite(flightId);
        setNotification({ message: 'Eliminado de favoritos.', type: 'success' });
      } catch (error) {
        console.error('Error:', error);
        setNotification({ message: 'Error al eliminar de favoritos.', type: 'error' });
      }
    };

    const getPassengerOptions = () => {
      const availableSeats = vuelo.capacidad_restante ?? 0;
      if (availableSeats <= 0) {
        return [<option key={0} value={0} disabled>0</option>];
      }
      const maxOptions = Math.min(availableSeats, 5);
      return Array.from({ length: maxOptions }, (_, i) => i + 1).map(n =>
        <option key={n} value={n}>{n}</option>
      );
    };

    const total = (vuelo.montoVuelo || 0) * personas;

    return (
      <article className="favorito-card">
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
        <div className="favorito-footer">
          <div className="form-group">
            <label>Pasajeros</label>
            <select value={personas} onChange={(e) => setPersonas(Number(e.target.value))} disabled={!vuelo.capacidad_restante || vuelo.capacidad_restante <= 0}>
              {getPassengerOptions()}
            </select>
          </div>
          <div className="precio">
            <span className="precio-label">Total</span>
            <span className="precio-valor">${total.toLocaleString()}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleReserve(vuelo, personas)}
            disabled={!vuelo.capacidad_restante || vuelo.capacidad_restante <= 0}
          >
            Reservar
          </button>
        </div>
      </article>
    );
  }

  return (
    <main className="favoritos-page">
      <div className="container">
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
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
            {vuelos.map((vuelo: Vuelo) => ( // Se añade el tipo explícito aquí
              <FavoritoCard key={vuelo.id} vuelo={vuelo} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};