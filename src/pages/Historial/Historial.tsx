import './Historial.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationModal } from '../../components/layout/ConfirmationModal';

interface Reserva {
  id: number;
  fecha_reserva: string;
  valor_reserva: number;
  estado: 'confirmado' | 'cancelado' | 'completado';
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

type TabType = 'proximos' | 'pasados' | 'cancelados';

export const MisViajes: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('proximos');
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null);
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

  const handleCancelClick = (reservaId: number) => {
    setReservationToCancel(reservaId);
    setShowConfirmModal(true);
  };

  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;
    setCancelingId(reservationToCancel);
    setShowConfirmModal(false);
    try {
      await axios.patch(`/api/reservations/${reservationToCancel}/cancel`, {}, {
        withCredentials: true
      });
      setReservas(prev =>
        prev.map(reserva =>
          reserva.id === reservationToCancel
            ? { ...reserva, estado: 'cancelado' }
            : reserva
        )
      );
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setCancelingId(null);
      setReservationToCancel(null);
    }
  };

  const cancelModal = () => {
    setShowConfirmModal(false);
    setReservationToCancel(null);
  };

  const esVueloPasado = (fechaSalida: string): boolean => new Date(fechaSalida) < new Date();
  const puedeCancelar = (reserva: Reserva): boolean => reserva.estado === 'confirmado' && !esVueloPasado(reserva.flight.fechahora_salida);
  const formatearFecha = (fecha: string): string => new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatearHora = (fecha: string): string => new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const getEstadoBadgeClass = (estado: string): string => `badge-${estado}`;
  const getEstadoTexto = (estado: string): string => estado.charAt(0).toUpperCase() + estado.slice(1);

  const reservasFiltradas = reservas.filter(reserva => {
    const vueloPasado = esVueloPasado(reserva.flight.fechahora_salida);
    switch (activeTab) {
      case 'proximos': return reserva.estado === 'confirmado' && !vueloPasado;
      case 'pasados': return reserva.estado === 'completado' || (reserva.estado === 'confirmado' && vueloPasado);
      case 'cancelados': return reserva.estado === 'cancelado';
      default: return true;
    }
  });

  const getImageUrl = (imagen: string | null | undefined): string => {
    if (!imagen) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
    return imagen.startsWith('http') ? imagen : imagen;
  };

  const contadorProximos = reservas.filter(r => r.estado === 'confirmado' && !esVueloPasado(r.flight.fechahora_salida)).length;
  const contadorPasados = reservas.filter(r => r.estado === 'completado' || (r.estado === 'confirmado' && esVueloPasado(r.flight.fechahora_salida))).length;
  const contadorCancelados = reservas.filter(r => r.estado === 'cancelado').length;

  if (authLoading || isLoading) {
    return (
      <main className="container"><section className="hero">
        <h1>Cargando tus viajes...</h1>
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      </section></main>
    );
  }

  if (error) {
    return (
      <main className="container"><section className="hero">
        <div className="error-message"><i className="fas fa-exclamation-triangle"></i>{error}</div>
        <button className="btn" onClick={fetchReservas}>Intentar de nuevo</button>
      </section></main>
    );
  }

  return (
    <main className="mis-viajes">
      <section className="mis-viajes-hero">
        <div className="container"><h1>Mis Viajes</h1><p>Gestiona todas tus reservas en un solo lugar</p></div>
      </section>
      <section className="mis-viajes-content">
        <div className="container">
          <div className="tabs">
            <button className={`tab ${activeTab === 'proximos' ? 'active' : ''}`} onClick={() => setActiveTab('proximos')}>
              <i className="fas fa-plane-departure"></i> Próximos viajes <span className="tab-count">{contadorProximos}</span>
            </button>
            <button className={`tab ${activeTab === 'pasados' ? 'active' : ''}`} onClick={() => setActiveTab('pasados')}>
              <i className="fas fa-history"></i> Historial <span className="tab-count">{contadorPasados}</span>
            </button>
            <button className={`tab ${activeTab === 'cancelados' ? 'active' : ''}`} onClick={() => setActiveTab('cancelados')}>
              <i className="fas fa-times-circle"></i> Cancelados <span className="tab-count">{contadorCancelados}</span>
            </button>
          </div>
          {reservasFiltradas.length === 0 ? (
            <div className="no-reservas">
              <i className="fas fa-suitcase-rolling"></i>
              <h3>No tienes viajes en esta categoría</h3>
              {activeTab === 'proximos' && <button className="btn" onClick={() => navigate('/destinos')}>Ver destinos</button>}
            </div>
          ) : (
            <div className="reservas-grid">
              {reservasFiltradas.map((reserva) => (
                <article key={reserva.id} className="reserva-card">
                  <div className="reserva-image" style={{ backgroundImage: `url(${getImageUrl(reserva.flight.destino.imagen)})` }}>
                    <span className={`estado-badge ${getEstadoBadgeClass(reserva.estado)}`}>{getEstadoTexto(reserva.estado)}</span>
                  </div>
                  <div className="reserva-content">
                    <h3 className="reserva-destino">{reserva.flight.destino.nombre}</h3>
                    <div className="reserva-ruta">
                      <span className="origen"><i className="fas fa-plane-departure"></i>{reserva.flight.origen}</span>
                      <i className="fas fa-arrow-right"></i>
                      <span className="destino"><i className="fas fa-plane-arrival"></i>{reserva.flight.destino.nombre}</span>
                    </div>
                    <div className="reserva-detalles">
                      <div className="detalle-item">
                        <i className="fas fa-calendar-alt"></i>
                        <div>
                          <span className="detalle-label">Salida</span>
                          <span className="detalle-valor">{formatearFecha(reserva.flight.fechahora_salida)} · {formatearHora(reserva.flight.fechahora_salida)}</span>
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
                      <button className="btn btn-outline" onClick={() => navigate(`/destinos/${reserva.flight.destino.id}`)}>Ver destino</button>
                      {puedeCancelar(reserva) && (
                        <button className="btn btn-danger" onClick={() => handleCancelClick(reserva.id)} disabled={cancelingId === reserva.id}>
                          {cancelingId === reserva.id ? (<><i className="fas fa-spinner fa-spin"></i> Cancelando...</>) : (<><i className="fas fa-times"></i> Cancelar</>)}
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
      {showConfirmModal && (
        <ConfirmationModal
          message="¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer."
          onConfirm={confirmCancelReservation}
          onCancel={cancelModal}
          confirmText="Sí, cancelar"
          cancelText="No"
        />
      )}
    </main>
  );
};