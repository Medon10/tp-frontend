import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoriteContext';
import { Notification } from '../../components/layout/Notification';
import './DetalleDestino.css';

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
<<<<<<< HEAD
  capacidad_restante?: number;
=======
  capacidad_restante: number;
>>>>>>> origin/main
  montoVuelo: number;
  precio_por_persona: number;
  origen: string;
  destino: Destino;
}

export const DetalleDestino: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [destino, setDestino] = useState<Destino | null>(null);
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [filtroAerolinea, setFiltroAerolinea] = useState('todas');
  const [ordenPrecio, setOrdenPrecio] = useState<'asc' | 'desc' | 'none'>('none');
  const { isAuthenticated } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    fetchDestinoYVuelos();
  }, [id]);

  const fetchDestinoYVuelos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [destinoResponse, vuelosResponse] = await Promise.all([
        axios.get<{ data: Destino }>(`/api/destinies/${id}`),
        axios.get<{ data: Vuelo[] }>(`/api/flights/destino/${id}`)
      ]);
      setDestino(destinoResponse.data.data);
      setVuelos(vuelosResponse.data.data || []);
    } catch (err: any) {
      setError('No se pudieron cargar los datos del destino.');
    } finally {
      setIsLoading(false);
    }
  };

 const handleReserve = async (vuelo: Vuelo, personas: number) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (personas <= 0) {
        setNotification({ message: 'Debe seleccionar al menos 1 pasajero.', type: 'error'});
        return;
    }
    try {
      const response = await axios.post<{ message: string }>('/api/reservations', {
        flight_id: vuelo.id,
        personas: personas,
      }, { withCredentials: true });
      setNotification({ message: response.data.message, type: 'success' });
      fetchDestinoYVuelos();
    } catch (err: any) {
      setNotification({ message: err.response?.data?.message || 'Error al procesar la reserva.', type: 'error' });
    }
  };
  
  const formatearFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  const formatearHora = (fecha: string) => new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatearDuracion = (minutos: number) => `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
  const getImageUrl = (imagen: string | null | undefined): string => {
    if (!imagen) return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop`;
    return `http://localhost:3000${imagen}`;
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

  if (isLoading) return <div className="container" style={{textAlign: 'center', padding: '4rem'}}>Cargando...</div>;
  if (error) return <div className="container error-message" style={{textAlign: 'center', padding: '4rem'}}>{error}</div>;
  if (!destino) return <div className="container" style={{textAlign: 'center', padding: '4rem'}}>Destino no encontrado.</div>;

  return (
    <main className="detalle-destino-page">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <section className="destino-hero-large" style={{ backgroundImage: `url(${getImageUrl(destino.imagen)})` }}>
         <div className="hero-overlay"><div className="container"><button className="btn-back" onClick={() => navigate('/destinos')}><i className="fas fa-arrow-left"></i> Volver</button><h1>{destino.nombre}</h1></div></div>
       </section>
      <section className="vuelos-section">
        <div className="container">
          <div className="vuelos-header">
            <div><h2>Vuelos disponibles</h2><p className="vuelos-count">{vuelosFiltrados.length} {vuelosFiltrados.length === 1 ? 'vuelo encontrado' : 'vuelos encontrados'}</p></div>
            <div className="filtros">
              <div className="filtro-group">
                <label htmlFor="aerolinea"><i className="fas fa-plane"></i>Aerolínea</label>
                <select id="aerolinea" value={filtroAerolinea} onChange={(e) => setFiltroAerolinea(e.target.value)}><option value="todas">Todas</option>{aerolineasUnicas.map(aerolinea => (<option key={aerolinea} value={aerolinea}>{aerolinea}</option>))}</select>
              </div>
              <div className="filtro-group">
                <label htmlFor="precio"><i className="fas fa-sort-amount-down"></i>Precio</label>
                <select id="precio" value={ordenPrecio} onChange={(e) => setOrdenPrecio(e.target.value as any)}><option value="none">Sin ordenar</option><option value="asc">Menor a mayor</option><option value="desc">Mayor a menor</option></select>
              </div>
            </div>
          </div>
          {vuelosFiltrados.length > 0 ? (
            <div className="vuelos-grid">{vuelosFiltrados.map((vuelo) => (<VueloCard key={vuelo.id} vuelo={vuelo} />))}</div>
          ) : (
<<<<<<< HEAD
            <div className="no-vuelos"><i className="fas fa-plane-slash"></i><h3>No hay vuelos disponibles</h3><p>Intenta cambiar los filtros o vuelve más tarde</p></div>
=======
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
                    <i className="fas fa-chair"></i>
                    <span>
                      {vuelo.capacidad_restante ?? vuelo.cantidad_asientos ?? 0} asientos disponibles
                    </span>
                  </div>
                </div>

                <div className="vuelo-footer">
                  <div className="precio">
                    <span className="precio-label">Desde</span>
                    <span className="precio-valor">
                      ${(vuelo.precio_por_persona ?? vuelo.montoVuelo ?? 0).toLocaleString('es-AR')}
                    </span>
                    <span className="precio-moneda">USD/persona</span>
                  </div>
                  <button className="btn btn-primary">
                    Reservar
                  </button>
                </div>
                </article>
              ))}
            </div>
>>>>>>> origin/main
          )}
        </div>
      </section>
    </main>
  );

  function VueloCard({ vuelo }: { vuelo: Vuelo }) {
    const [personas, setPersonas] = useState(1);
    const handleFavoriteToggle = async () => {
      if (!isAuthenticated) { navigate('/login', { state: { from: location } }); return; }
      try {
        if (isFavorite(vuelo.id)) { await removeFavorite(vuelo.id); } else { await addFavorite(vuelo.id); }
      } catch (error) {
        setNotification({ message: 'Error al actualizar favoritos.', type: 'error' });
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

    return (
      <article className="vuelo-card">
        <div className="vuelo-header">
          <div className="aerolinea"><i className="fas fa-plane"></i><span>{vuelo.aerolinea}</span></div>
          <button className={`btn-favorite-vuelo ${isFavorite(vuelo.id) ? 'active' : ''}`} onClick={handleFavoriteToggle}>
            <i className={isFavorite(vuelo.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>
        </div>
        <div className="vuelo-ruta">
          <div className="origen"><span className="hora">{formatearHora(vuelo.fechahora_salida)}</span><span className="fecha">{formatearFecha(vuelo.fechahora_salida)}</span></div>
          <div className="duracion"><span>{formatearDuracion(vuelo.duracion)}</span><div className="path-line"></div></div>
          <div className="destino"><span className="hora">{formatearHora(vuelo.fechahora_llegada)}</span><span className="fecha">{formatearFecha(vuelo.fechahora_llegada)}</span></div>
        </div>
        <div className="vuelo-footer">
          <div className="form-group">
            <label>Pasajeros</label>
            <select value={personas} onChange={(e) => setPersonas(Number(e.target.value))} disabled={!vuelo.capacidad_restante || vuelo.capacidad_restante <= 0}>
              {getPassengerOptions()}
            </select>
          </div>
          <div className="precio">
            <span className="precio-label">Total</span>
            <span className="precio-valor">${(vuelo.montoVuelo * personas).toLocaleString()}</span>
          </div>
          <button className="btn btn-primary" onClick={() => handleReserve(vuelo, personas)} disabled={!vuelo.capacidad_restante || vuelo.capacidad_restante <= 0}>
            Reservar
          </button>
        </div>
      </article>
    );
  }
};