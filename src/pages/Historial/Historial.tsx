import './Historial.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationModal } from '../../components/layout/ConfirmationModal';
import { Notification } from '../../components/layout/Notification';

// Se define la interfaz aquí para que el componente sea autocontenido
interface Reserva {
  id: number;
  fecha_reserva: string;
  valor_reserva: number;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  isPast: boolean;
  canCancel: boolean;
  flight: {
    id: number;
    origen: string;
    fechahora_salida: string;
    fechahora_llegada: string;
    aerolinea: string;
    destino: {
      id: number;
      nombre: string;
      imagen: string;
    };
  };
}

export const Historial: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('proximos');
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null);
  // Esta es la línea que faltaba
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        fetchReservas();
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchReservas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get<{ data: Reserva[] }>('/api/reservations/misviajes', {
        withCredentials: true
      });
      setReservas(response.data.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('No se pudieron cargar tus viajes. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = (reservaId: number) => {
    setReservationToCancel(reservaId);
    setIsConfirmOpen(true);
  };

  const executeCancelReservation = async () => {
    if (!reservationToCancel) return;

    setCancelingId(reservationToCancel);
    setIsConfirmOpen(false);

    try {
      await axios.patch(`/api/reservations/${reservationToCancel}/cancel`, {}, {
        withCredentials: true
      });
      // Ahora se usa la notificación personalizada para el éxito.
      setNotification({ message: 'Reserva cancelada exitosamente', type: 'success' });
      fetchReservas();
    } catch (error: any) {
      // Y también para los errores.
      setNotification({ message: error.response?.data?.message || 'Error al cancelar la reserva', type: 'error' });
    } finally {
      setCancelingId(null);
      setReservationToCancel(null);
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearHora = (fecha: string): string => {
    return new Date(fecha).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadgeClass = (estado: string): string => {
    switch (estado) {
      case 'confirmado': return 'badge-confirmado';
      case 'pendiente': return 'badge-pendiente';
      case 'cancelado': return 'badge-cancelado';
      case 'completado': return 'badge-completado';
      default: return '';
    }
  };

  const getEstadoTexto = (estado: string): string => {
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const getImageUrl = (imagen: string | null | undefined): string => {
    if (!imagen) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
    if (imagen.startsWith('http')) return imagen;
    return `http://localhost:3000${imagen}`;
  };

  const reservasFiltradas = reservas.filter(reserva => {
    switch (activeTab) {
      case 'proximos':
        return !reserva.isPast && reserva.estado !== 'cancelado';
      case 'pasados':
        return reserva.isPast || reserva.estado === 'completado';
      case 'cancelados':
        return reserva.estado === 'cancelado';
      default:
        return true;
    }
  });

  if (authLoading || isLoading) {
    return (
      <main className="container">
        <section className="hero">
          <h1>Cargando tus viajes...</h1>
          <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <section className="hero">
          <div className="error-message"><i className="fas fa-exclamation-triangle"></i>{error}</div>
          <button className="btn" onClick={fetchReservas}>Intentar de nuevo</button>
        </section>
      </main>
    );
  }

  return (
    <main className="mis-viajes-page">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      
      <section className="mis-viajes-hero">
        <div className="container">
          <h1>Mis Viajes</h1>
          <p>Gestiona todas tus reservas en un solo lugar</p>
        </div>
      </section>

      <section className="mis-viajes-content">
        <div className="container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'proximos' ? 'active' : ''}`}
              onClick={() => setActiveTab('proximos')}
            >
              <i className="fas fa-plane-departure"></i>
              Próximos viajes
              <span className="tab-count">
                {reservas.filter(r => !r.isPast && r.estado !== 'cancelado').length}
              </span>
            </button>
            <button
              className={`tab ${activeTab === 'pasados' ? 'active' : ''}`}
              onClick={() => setActiveTab('pasados')}
            >
              <i className="fas fa-history"></i>
              Historial
              <span className="tab-count">
                {reservas.filter(r => r.isPast || r.estado === 'completado').length}
              </span>
            </button>
            <button
              className={`tab ${activeTab === 'cancelados' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelados')}
            >
              <i className="fas fa-times-circle"></i>
              Cancelados
              <span className="tab-count">
                {reservas.filter(r => r.estado === 'cancelado').length}
              </span>
            </button>
          </div>

          {reservasFiltradas.length === 0 ? (
            <div className="no-reservas">
              <i className="fas fa-suitcase-rolling"></i>
              <h3>No tienes viajes en esta categoría</h3>
              <p>
                {activeTab === 'proximos' && 'Explora destinos y reserva tu próximo viaje'}
                {activeTab === 'pasados' && 'Aún no has completado ningún viaje'}
                {activeTab === 'cancelados' && 'No tienes reservas canceladas'}
              </p>
              {activeTab === 'proximos' && (
                <button className="btn" onClick={() => navigate('/destinos')}>
                  Ver destinos
                </button>
              )}
            </div>
          ) : (
            <div className="reservas-grid">
              {reservasFiltradas.map((reserva) => (
                <article key={reserva.id} className="reserva-card">
                  <div
                    className="reserva-image"
                    style={{ backgroundImage: `url(${getImageUrl(reserva.flight.destino.imagen)})` }}
                  >
                    <span className={`estado-badge ${getEstadoBadgeClass(reserva.estado)}`}>
                      {getEstadoTexto(reserva.estado)}
                    </span>
                  </div>

                  <div className="reserva-content">
                    <h3 className="reserva-destino">{reserva.flight.destino.nombre}</h3>

                    <div className="reserva-ruta">
                      <span className="origen">
                        <i className="fas fa-plane-departure"></i>
                        {reserva.flight.origen}
                      </span>
                      <i className="fas fa-arrow-right"></i>
                      <span className="destino">
                        <i className="fas fa-plane-arrival"></i>
                        {reserva.flight.destino.nombre}
                      </span>
                    </div>

                    <div className="reserva-detalles">
                      <div className="detalle-item">
                        <i className="fas fa-calendar-alt"></i>
                        <div>
                          <span className="detalle-label">Salida</span>
                          <span className="detalle-valor">
                            {formatearFecha(reserva.flight.fechahora_salida)} · {formatearHora(reserva.flight.fechahora_salida)}
                          </span>
                        </div>
                      </div>

                      <div className="detalle-item">
                        <i className="fas fa-plane"></i>
                        <div>
                          <span className="detalle-label">Aerolínea</span>
                          <span className="detalle-valor">{reserva.flight.aerolinea}</span>
                        </div>
                      </div>

                      <div className="detalle-item">
                        <i className="fas fa-dollar-sign"></i>
                        <div>
                          <span className="detalle-label">Precio</span>
                          <span className="detalle-valor">${reserva.valor_reserva.toLocaleString()} USD</span>
                        </div>
                      </div>
                    </div>

                    <div className="reserva-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => navigate(`/destinos/${reserva.flight.destino.id}`)}
                      >
                        Ver destino
                      </button>
                      
                      {reserva.canCancel && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancelReservation(reserva.id)}
                          disabled={cancelingId === reserva.id}
                        >
                          {cancelingId === reserva.id ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times"></i>
                              Cancelar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {isConfirmOpen && (
        <ConfirmationModal
          message="¿Estás seguro de que deseas cancelar esta reserva?"
          onConfirm={executeCancelReservation}
          onCancel={() => setIsConfirmOpen(false)}
          confirmText="Sí, cancelar"
          confirmButtonClass="btn-danger"
        />
      )}
    </main>
  );
};