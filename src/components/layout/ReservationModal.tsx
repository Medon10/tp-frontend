import './ReservationModal.css';
import React, { useState } from 'react';
import axios from 'axios';

interface Vuelo {
  id: number;
  origen: string;
  destino: {
    id: number;
    nombre: string;
  };
  fechahora_salida: string;
  precio_por_persona: number;
  capacidad_restante: number;
}

interface ReservationModalProps {
  flight: Vuelo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  flight,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const precioTotal = flight.precio_por_persona * cantidadPersonas;

  const handleReservar = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        '/api/reservations',
        {
          flight_id: flight.id,
          cantidad_personas: cantidadPersonas
        },
        { withCredentials: true }
      );

      console.log(' Reserva creada:', response.data);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(' Error al reservar:', error);
      setError(error.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
              <span>${flight.precio_por_persona.toLocaleString('es-AR')} USD</span>
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