import './Favoritos.css';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoriteContext';

export const Favoritos: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favorites, removeFavorite, loading } = useFavorites();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
              {favorites.length === 0 
                ? 'Aún no has guardado ningún vuelo favorito'
                : `${favorites.length} ${favorites.length === 1 ? 'vuelo guardado' : 'vuelos guardados'}`
              }
            </p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/destinos')}>
            <i className="fas fa-search"></i>
            Buscar vuelos
          </button>
        </div>

        {favorites.length === 0 ? (
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
            {favorites.map((favorito) => {
              const vuelo = favorito.vuelo;
              
              return (
                <article key={favorito.id} className="favorito-card">
                  <div className="favorito-header">
                    <div className="aerolinea">
                      <i className="fas fa-plane"></i>
                      <span>{vuelo.origen}</span>
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
                      <span>{vuelo.duracion ? formatearDuracion(vuelo.duracion) : 'Desconocida'}</span>
                    </div>

                    <div className="destino">
                      <span className="ciudad">{vuelo.destino?.nombre || 'Destino'}</span>
                      <span className="hora">{formatearHora(vuelo.fechahora_llegada)}</span>
                      <span className="fecha">{formatearFecha(vuelo.fechahora_llegada)}</span>
                    </div>
                  </div>

                  <div className="favorito-info">
                    <div className="info-item">
                      <i className="fas fa-chair"></i>
                      <span>{vuelo.capacidad_restante ?? 0} asientos disponibles</span>
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
                      <span className="precio-valor">${vuelo.precio_por_persona.toLocaleString('es-AR')}</span>
                      <span className="precio-moneda">USD/persona</span>
                    </div>
                    <div className="footer-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={() => navigate(`/destinos/${vuelo.destino.id}`)}
                      >
                        Ver destino
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/reservar/${vuelo.id}`)}
                      >
                        Reservar
                      </button>
                    </div>
                  </div>

                  <div className="fecha-guardado">
                    <i className="fas fa-clock"></i>
                    <span>Guardado el {formatearFecha(favorito.fecha_guardado)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};