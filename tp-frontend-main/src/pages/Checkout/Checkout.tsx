import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Checkout.css';

interface Flight {
  id: number;
  fechahora_salida: string;
  fechahora_llegada: string;
  duracion: number;
  aerolinea: string;
  cantidad_asientos: number;
  montoVuelo: number;
  origen: string;
  destino: {
    id: number;
    nombre: string;
    transporte?: string[];
    actividades?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface CheckoutState {
  flight: Flight;
  travelers: number;
  totalPrice: number;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get flight data from navigation state
  const checkoutState = location.state as CheckoutState | null;

  // Form states
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // If no flight data, redirect back to home
  useEffect(() => {
    if (!checkoutState) {
      navigate('/');
      return;
    }

    // Initialize passenger forms based on number of travelers
    const initialPassengers: PassengerInfo[] = [];
    for (let i = 0; i < checkoutState.travelers; i++) {
      initialPassengers.push({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentType: 'dni',
        documentNumber: '',
        birthDate: ''
      });
    }
    setPassengers(initialPassengers);
  }, [checkoutState, navigate]);

  if (!checkoutState) {
    return <div>Cargando...</div>;
  }

  const { flight, travelers, totalPrice } = checkoutState;

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    // Validate passengers
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      if (!passenger.firstName || !passenger.lastName || !passenger.email || 
          !passenger.phone || !passenger.documentNumber || !passenger.birthDate) {
        return `Por favor completa todos los campos del pasajero ${i + 1}`;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(passenger.email)) {
        return `Email inválido para pasajero ${i + 1}`;
      }
    }

    // Validate payment
    if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || 
        !paymentInfo.cvv || !paymentInfo.cardholderName) {
      return 'Por favor completa todos los campos de pago';
    }

    // Card number validation (simple check for 16 digits)
    if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      return 'Número de tarjeta debe tener 16 dígitos';
    }

    // CVV validation
    if (paymentInfo.cvv.length !== 3) {
      return 'CVV debe tener 3 dígitos';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      
      // Redirect to confirmation after 3 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      
    } catch (err) {
      setError('Error al procesar la reserva. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (success) {
    return (
      <div className="checkout-success">
        <div className="success-content">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>¡Reserva Confirmada!</h2>
          <p>Tu vuelo ha sido reservado exitosamente.</p>
          <p>Recibirás un email de confirmación en breve.</p>
          <div className="success-flight-info">
            <p><strong>{flight.aerolinea}</strong></p>
            <p>{flight.origen} → {flight.destino.nombre}</p>
            <p>{formatDate(flight.fechahora_salida)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={() => navigate('/')} className="back-button">
          <i className="fas fa-arrow-left"></i>
          Volver a búsqueda
        </button>
        <h1>Finalizar Reserva</h1>
      </div>

      <div className="checkout-content">
        {/* Flight Summary */}
        <div className="flight-summary">
          <h2><i className="fas fa-plane"></i> Resumen del Vuelo</h2>
          <div className="summary-card">
            <div className="flight-header">
              <div className="airline">{flight.aerolinea}</div>
              <div className="price">{formatPrice(totalPrice)}</div>
            </div>
            <div className="flight-route">
              <div className="departure">
                <div className="time">{formatTime(flight.fechahora_salida)}</div>
                <div className="location">{flight.origen}</div>
                <div className="date">{formatDate(flight.fechahora_salida)}</div>
              </div>
              <div className="arrow">→</div>
              <div className="arrival">
                <div className="time">{formatTime(flight.fechahora_llegada)}</div>
                <div className="location">{flight.destino.nombre}</div>
                <div className="date">{formatDate(flight.fechahora_llegada)}</div>
              </div>
            </div>
            <div className="flight-details">
              <span><i className="fas fa-users"></i> {travelers} {travelers === 1 ? 'pasajero' : 'pasajeros'}</span>
              <span><i className="fas fa-clock"></i> {flight.duracion} horas</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Passenger Information */}
          <div className="form-section">
            <h2><i className="fas fa-user"></i> Información de Pasajeros</h2>
            {passengers.map((passenger, index) => (
              <div key={index} className="passenger-form">
                <h3>Pasajero {index + 1}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                      placeholder="Nombre"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                      placeholder="Apellido"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                      placeholder="email@ejemplo.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={passenger.phone}
                      onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                      placeholder="+54 11 1234-5678"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Documento</label>
                    <select
                      value={passenger.documentType}
                      onChange={(e) => handlePassengerChange(index, 'documentType', e.target.value)}
                    >
                      <option value="dni">DNI</option>
                      <option value="passport">Pasaporte</option>
                      <option value="cedula">Cédula</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Número de Documento</label>
                    <input
                      type="text"
                      value={passenger.documentNumber}
                      onChange={(e) => handlePassengerChange(index, 'documentNumber', e.target.value)}
                      placeholder="12345678"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={passenger.birthDate}
                      onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Information */}
          <div className="form-section">
            <h2><i className="fas fa-credit-card"></i> Información de Pago</h2>
            <div className="payment-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre del Titular</label>
                  <input
                    type="text"
                    value={paymentInfo.cardholderName}
                    onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                    placeholder="Nombre como aparece en la tarjeta"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Número de Tarjeta</label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => handlePaymentChange('cardNumber', e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="text"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    value={paymentInfo.cvv}
                    onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <div className="checkout-actions">
            <div className="total-price">
              <span>Total a pagar: <strong>{formatPrice(totalPrice)}</strong></span>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-confirm"
            >
              {loading ? (
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
        </form>
      </div>
    </div>
  );
};