import './ReservationModal.css';
import React, { useState } from 'react';
import { api } from '../../services/api';
import type { Destino } from '../../types';

/** Datos mínimos que el modal necesita del vuelo.
 *  Es compatible tanto con Vuelo (desde DetalleDestino)
 *  como con VueloBusqueda adaptado (desde Home). */
interface ReservationFlightData {
  id: number;
  origen: string;
  destino: Pick<Destino, 'nombre'>;
  fechahora_salida: string;
  precio_por_persona?: number;
  capacidad_restante: number;
}

interface ReservationModalProps {
  flight: ReservationFlightData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // mantenemos la prop para compatibilidad pero no la usamos aquí
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  flight,
  isOpen,
  onClose
}) => {
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStarted, setPaymentStarted] = useState(false);

  const precioTotal = (flight.precio_por_persona ?? 0) * cantidadPersonas;

  const handleReservar = async () => {
    setError('');
    setIsLoading(true);

    try {
      // 1. Crear la reserva
      const reservaResp = await api.post('/reservations', {
        flight_id: flight.id,
        cantidad_personas: cantidadPersonas
      });

      const reservationId = reservaResp.data?.data?.id;
      if (!reservationId) {
        throw new Error('No se obtuvo ID de la reserva');
      }

      // 2. Crear preferencia de pago Mercado Pago
      const prefResp = await api.post('/payments/create-preference', {
        reservationId
      });

      const initPoint = prefResp.data?.data?.init_point;
      if (!initPoint) {
        throw new Error('No se obtuvo init_point de Mercado Pago');
      }

      // 3. Abrir checkout en nueva pestaña y mostrar feedback
      window.open(initPoint, '_blank');
      setPaymentStarted(true);
    } catch (error: any) {
      setError(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Error al crear la reserva'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Si ya se abrió MP en otra pestaña, mostrar mensaje de feedback
  if (paymentStarted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>

          <div className="modal-header">
            <i className="fas fa-external-link-alt modal-icon" style={{ color: 'var(--primary, #3a86ff)' }}></i>
            <h2>Completá el pago</h2>
          </div>

          <div className="modal-body" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.05rem', color: '#666', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Se abrió <strong>Mercado Pago</strong> en una nueva pestaña.
              Completá el pago allí y luego volvé a esta página.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              Podés ver el estado de tu reserva en <strong>"Mis Viajes"</strong>.
            </p>
          </div>

          <div className="modal-footer">
            <button className="btn" onClick={onClose}>
              <i className="fas fa-check"></i>
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-header">
          <i className="fas fa-plane-departure modal-icon"></i>
          <h2>Confirmar Reserva</h2>
        </div>

        <div className="modal-body">
          <div className="reservation-info">
            <div className="info-row">
              <span className="info-label">
                <i className="fas fa-map-marker-alt"></i>
                Origen:
              </span>
              <span className="info-value">{flight.origen}</span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <i className="fas fa-map-pin"></i>
                Destino:
              </span>
              <span className="info-value">{flight.destino.nombre}</span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <i className="fas fa-calendar"></i>
                Fecha de salida:
              </span>
              <span className="info-value">
                {new Date(flight.fechahora_salida).toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <i className="fas fa-clock"></i>
                Hora:
              </span>
              <span className="info-value">
                {new Date(flight.fechahora_salida).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="passengers-selector">
            <label htmlFor="cantidadPersonas">
              <i className="fas fa-users"></i>
              Cantidad de personas:
            </label>
            <div className="quantity-control">
              <button
                type="button"
                onClick={() => setCantidadPersonas(Math.max(1, cantidadPersonas - 1))}
                disabled={cantidadPersonas <= 1}
              >
                <i className="fas fa-minus"></i>
              </button>
              <input
                type="number"
                id="cantidadPersonas"
                value={cantidadPersonas}
                onChange={(e) => setCantidadPersonas(Math.max(1, Math.min(flight.capacidad_restante, Number(e.target.value))))}
                min="1"
                max={flight.capacidad_restante}
              />
              <button
                type="button"
                onClick={() => setCantidadPersonas(Math.min(flight.capacidad_restante, cantidadPersonas + 1))}
                disabled={cantidadPersonas >= flight.capacidad_restante}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <small>Disponibles: {flight.capacidad_restante} asientos</small>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Precio por persona:</span>
              <span>${(flight.precio_por_persona ?? 0).toLocaleString('es-AR')} USD</span>
            </div>
            <div className="price-row">
              <span>Cantidad de personas:</span>
              <span>× {cantidadPersonas}</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span>${precioTotal.toLocaleString('es-AR')} USD</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className="btn"
            onClick={handleReservar}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Procesando...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Confirmar Reserva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};