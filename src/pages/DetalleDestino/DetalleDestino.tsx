import './DetalleDestino.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
}

export const DetalleDestino: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [destino, setDestino] = useState<Destino | null>(null);
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroAerolinea, setFiltroAerolinea] = useState('todas');
  const [ordenPrecio, setOrdenPrecio] = useState<'asc' | 'desc' | 'none'>('none');

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const handleToggleFavorite = async (flightId: number) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para guardar favoritos');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite(flightId)) {
        await removeFavorite(flightId);
      } else {
        await addFavorite(flightId);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar favoritos');
    }
  };

  useEffect(() => {
    fetchDestinoYVuelos();
  }, [id]);

  const fetchDestinoYVuelos = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Obtener destino
      const destinoResponse = await axios.get(`/api/destinies/${id}`);
      const destinoData = (destinoResponse.data as { data: Destino }).data;
      setDestino(destinoData);

      // Obtener vuelos del destino
      const vuelosResponse = await axios.get(`/api/flights/destino/${id}`);
      const vuelosData = (vuelosResponse.data as { data: Vuelo[] }).data;
      setVuelos(vuelosData || []);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      setError('No se pudieron cargar los datos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
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

  const getImageUrl = (imagen: string | null | undefined): string => {
    if (!imagen) {
      return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop`;
    }
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    return imagen;
  };


  //filtrado y ordenamiento de vuelos por aerolinea y precio
  const aerolineasUnicas = Array.from(new Set(vuelos.map(v => v.aerolinea)));

  const vuelosFiltrados = vuelos
    .filter(vuelo => filtroAerolinea === 'todas' || vuelo.aerolinea === filtroAerolinea)
    .sort((a, b) => {
      if (ordenPrecio === 'asc') return a.montoVuelo - b.montoVuelo;
      if (ordenPrecio === 'desc') return b.montoVuelo - a.montoVuelo;
      return 0;
    });

  if (isLoading) {
    return (
      <main className="container">
        <section className="hero">
          <h1>Cargando...</h1>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </section>
      </main>
    );
  }

  if (error || !destino) {
    return (
      <main className="container">
        <section className="hero">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error || 'Destino no encontrado'}
          </div>
          <button className="btn" onClick={() => navigate('/destinos')}>
            Volver a destinos
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="detalle-destino-page">
      {/* Hero con imagen del destino */}
      <section 
        className="destino-hero-large"
        style={{ backgroundImage: `url(${getImageUrl(destino.imagen)})` }}
      >
        <div className="hero-overlay">
          <div className="container">
            <button className="btn-back" onClick={() => navigate('/destinos')}>
              <i className="fas fa-arrow-left"></i>
              Volver
            </button>
            <h1>{destino.nombre}</h1>
            <div className="destino-quick-info">
              {destino.transporte && destino.transporte.length > 0 && (
                <div className="quick-info-item">
                  <i className="fas fa-bus"></i>
                  <span>{destino.transporte.join(', ')}</span>
                </div>
              )}
              {destino.actividades && destino.actividades.length > 0 && (
                <div className="quick-info-item">
                  <i className="fas fa-hiking"></i>
                  <span>{destino.actividades.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Vuelos disponibles */}
      <section className="vuelos-section">
        <div className="container">
          <div className="vuelos-header">
            <div>
              <h2>Vuelos disponibles</h2>
              <p className="vuelos-count">
                {vuelosFiltrados.length} {vuelosFiltrados.length === 1 ? 'vuelo encontrado' : 'vuelos encontrados'}
              </p>
            </div>

            <div className="filtros">
              <div className="filtro-group">
                <label htmlFor="aerolinea">
                  <i className="fas fa-plane"></i>
                  Aerolínea
                </label>
                <select 
                  id="aerolinea"
                  value={filtroAerolinea}
                  onChange={(e) => setFiltroAerolinea(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  {aerolineasUnicas.map(aerolinea => (
                    <option key={aerolinea} value={aerolinea}>
                      {aerolinea}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-group">
                <label htmlFor="precio">
                  <i className="fas fa-sort-amount-down"></i>
                  Precio
                </label>
                <select 
                  id="precio"
                  value={ordenPrecio}
                  onChange={(e) => setOrdenPrecio(e.target.value as any)}
                >
                  <option value="none">Sin ordenar</option>
                  <option value="asc">Menor a mayor</option>
                  <option value="desc">Mayor a menor</option>
                </select>
              </div>
            </div>
          </div>

          {vuelosFiltrados.length === 0 ? (
            <div className="no-vuelos">
              <i className="fas fa-plane-slash"></i>
              <h3>No hay vuelos disponibles</h3>
              <p>Intenta cambiar los filtros o vuelve más tarde</p>
            </div>
          ) : (
            <div className="vuelos-grid">
              {vuelosFiltrados.map((vuelo) => (
                <article key={vuelo.id} className="vuelo-card">
                  <div className="vuelo-header">
                    <div className="aerolinea">
                      <i className="fas fa-plane"></i>
                      <span>{vuelo.aerolinea}</span>
                    </div>
                    <button 
                      className={`btn-favorite-vuelo ${isFavorite(vuelo.id) ? 'active' : ''}`}
                      onClick={() => handleToggleFavorite(vuelo.id)}
                      aria-label={isFavorite(vuelo.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                      >
                      <i className={isFavorite(vuelo.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                    </button>
                  </div>

                  <div className="vuelo-ruta">
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
                      <span className="ciudad">{destino.nombre}</span>
                      <span className="hora">{formatearHora(vuelo.fechahora_llegada)}</span>
                      <span className="fecha">{formatearFecha(vuelo.fechahora_llegada)}</span>
                    </div>
                  </div>

                  <div className="vuelo-info">
                    <div className="info-item">
                      <i className="fas fa-users"></i>
                      <span>{vuelo.cantidad_asientos} asientos</span>
                    </div>
                  </div>

                  <div className="vuelo-footer">
                    <div className="precio">
                      <span className="precio-label">Desde</span>
                      <span className="precio-valor">${vuelo.montoVuelo.toLocaleString()}</span>
                      <span className="precio-moneda">USD</span>
                    </div>
                    <button className="btn btn-primary">
                      Reservar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Información adicional */}
      <section className="destino-info-extra">
        <div className="container">
          <div className="info-cards">
            <div className="info-card">
              <i className="fas fa-info-circle"></i>
              <h3>Sobre {destino.nombre}</h3>
              <p>Descubre este increíble destino con nuestras mejores ofertas de vuelos.</p>
            </div>

            {destino.actividades && destino.actividades.length > 0 && (
              <div className="info-card">
                <i className="fas fa-map-marked-alt"></i>
                <h3>Actividades populares</h3>
                <ul>
                  {destino.actividades.map((actividad, index) => (
                    <li key={index}>{actividad}</li>
                  ))}
                </ul>
              </div>
            )}

            {destino.transporte && destino.transporte.length > 0 && (
              <div className="info-card">
                <i className="fas fa-bus"></i>
                <h3>Transporte local</h3>
                <ul>
                  {destino.transporte.map((transporte, index) => (
                    <li key={index}>{transporte}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};