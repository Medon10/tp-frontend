import './DetalleDestino.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoriteContext';
import { ReservationModal } from '../../components/layout/ReservationModal';
import { Notification } from '../../components/layout/Notification';


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
  capacidad_restante: number;
  montoVuelo: number;
  precio_por_persona: number;
  origen: string;
  destino: Destino;
}

export const DetalleDestino: React.FC = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // --- ESTADO ---
  const [destino, setDestino] = useState<Destino | null>(null);
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroAerolinea, setFiltroAerolinea] = useState('todas');
  const [ordenPrecio, setOrdenPrecio] = useState<'asc' | 'desc' | 'none'>('none');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Vuelo | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- EFECTOS ---
  useEffect(() => {
    fetchDestinoYVuelos();
  }, [id]);
  
  // useEffect para manejar la redirección después de la notificación de error
  useEffect(() => {
    if (notification && notification.type === 'error' && !notification.message.includes('actualizar')) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000); // 2 segundos

      return () => clearTimeout(timer);
    }
  }, [notification, navigate]);

  const fetchDestinoYVuelos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const destinoResponse = await api.get(`/destinies/${id}`);
      setDestino(destinoResponse.data.data);
      const vuelosResponse = await api.get(`/flights/destino/${id}`);
      setVuelos(vuelosResponse.data.data || []);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      setError('No se pudieron cargar los datos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleToggleFavorite = async (flightId: number) => {
    if (!isAuthenticated) {
      setNotification({ message: 'Debes iniciar sesión para guardar favoritos. Redirigiendo...', type: 'error' });
      return;
    }
    try {
      if (isFavorite(flightId)) {
        await removeFavorite(flightId);
      } else {
        await addFavorite(flightId);
      }
    } catch (error) {
      setNotification({ message: 'Error al actualizar favoritos', type: 'error' });
    }
  };

  const handleReservarClick = (vuelo: Vuelo) => {
    if (!isAuthenticated) {
      setNotification({ message: 'Debes iniciar sesión para reservar. Redirigiendo...', type: 'error' });
      return;
    }
    setSelectedFlight(vuelo);
    setIsModalOpen(true);
  };

  const handleReservationSuccess = () => {
    setIsModalOpen(false);
    setNotification({ message: '¡Reserva confirmada exitosamente!', type: 'success' });
    fetchDestinoYVuelos();
  };

  // --- FUNCIONES DE UTILIDAD ---
  const formatearFecha = (fecha: string): string => new Date(fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formatearHora = (fecha: string): string => new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const formatearDuracion = (minutos: number): string => `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
  const getImageUrl = (imagen: string | null | undefined): string => {
    if (!imagen) return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop`;
    if (imagen.startsWith('http')) return imagen;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const backendOrigin = apiUrl.replace(/\/?api\/?$/, '');
    return `${backendOrigin}${imagen}`;
  };


  const aerolineasUnicas = Array.from(new Set(vuelos.map(v => v.aerolinea)));
  const vuelosFiltrados = vuelos
    .filter(vuelo => filtroAerolinea === 'todas' || vuelo.aerolinea === filtroAerolinea)
    .sort((a, b) => {
      const precioA = a.precio_por_persona ?? a.montoVuelo ?? 0;
      const precioB = b.precio_por_persona ?? b.montoVuelo ?? 0;
      if (ordenPrecio === 'asc') return precioA - precioB;
      if (ordenPrecio === 'desc') return precioB - precioA;
      return 0;
    });
  

  if (isLoading) {
    return (
      <main className="container"><section className="hero">
        <h1>Cargando...</h1>
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      </section></main>
    );
  }

  if (error || !destino) {
    return (
      <main className="container"><section className="hero">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error || 'Destino no encontrado'}
        </div>
        <button className="btn" onClick={() => navigate('/destinos')}>Volver a destinos</button>
      </section></main>
    );
  }

  return (
    <main className="detalle-destino-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* ... (resto del JSX no cambia) ... */}
      <section className="destino-hero-large" style={{ backgroundImage: `url(${getImageUrl(destino.imagen)})` }}>
        <div className="hero-overlay"><div className="container">
            <button className="btn-back" onClick={() => navigate('/destinos')}>
              <i className="fas fa-arrow-left"></i> Volver
            </button>
            <h1>{destino.nombre}</h1>
        </div></div>
      </section>
      <section className="vuelos-section"><div className="container">
        <div className="vuelos-header">
            <h2>Vuelos disponibles</h2>
            <div className="filtros">
              <label>
                Aerolínea:
                <select value={filtroAerolinea} onChange={(e) => setFiltroAerolinea(e.target.value)}>
                  <option value="todas">Todas</option>
                  {aerolineasUnicas.map(a => (<option key={a} value={a}>{a}</option>))}
                </select>
              </label>
              <label>
                Ordenar por precio:
                <select value={ordenPrecio} onChange={(e) => setOrdenPrecio(e.target.value as any)}>
                  <option value="none">Sin ordenar</option>
                  <option value="asc">Menor a mayor</option>
                  <option value="desc">Mayor a menor</option>
                </select>
              </label>
            </div>
        </div>
        {vuelosFiltrados.length === 0 ? (
          <div className="no-vuelos"><p>No hay vuelos que coincidan con los filtros.</p></div>
        ) : (
          <div className="vuelos-grid">
            {vuelosFiltrados.map((vuelo) => (
              <article key={vuelo.id} className="vuelo-card">
              <div className="vuelo-header">
                <div className="aerolinea"><i className="fas fa-plane"></i><span>{vuelo.aerolinea}</span></div>
                <button className={`btn-favorite-vuelo ${isFavorite(vuelo.id) ? 'active' : ''}`} onClick={() => handleToggleFavorite(vuelo.id)} aria-label={isFavorite(vuelo.id) ? "Quitar de favoritos" : "Agregar a favoritos"}>
                  <i className={isFavorite(vuelo.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                </button>
              </div>
              <div className="vuelo-ruta">
                <div className="origen"><span className="ciudad">{vuelo.origen}</span><span className="hora">{formatearHora(vuelo.fechahora_salida)}</span><span className="fecha">{formatearFecha(vuelo.fechahora_salida)}</span></div>
                <div className="duracion"><i className="fas fa-arrow-right"></i><span>{formatearDuracion(vuelo.duracion)}</span></div>
                <div className="destino"><span className="ciudad">{destino.nombre}</span><span className="hora">{formatearHora(vuelo.fechahora_llegada)}</span><span className="fecha">{formatearFecha(vuelo.fechahora_llegada)}</span></div>
              </div>
              <div className="vuelo-info">
                  <div className="info-item"><i className="fas fa-chair"></i><span>{vuelo.capacidad_restante ?? vuelo.cantidad_asientos ?? 0} asientos disponibles</span></div>
              </div>
              <div className="vuelo-footer">
                <div className="precio"><span className="precio-label">Desde</span><span className="precio-valor">${(vuelo.precio_por_persona ?? vuelo.montoVuelo ?? 0).toLocaleString('es-AR')}</span><span className="precio-moneda">USD/persona</span></div>
                <button className="btn btn-primary" onClick={() => handleReservarClick(vuelo)}>Reservar</button>
              </div>
            </article>
            ))}
          </div>
        )}
      </div></section>
      <section className="destino-info-extra"></section>
      {selectedFlight && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          flight={selectedFlight}
          onSuccess={handleReservationSuccess}
        />
      )}
    </main>
  );
};