import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { setHours, setMinutes, startOfDay, endOfDay, format } from 'date-fns';
import { api } from '../../services/api';
import 'react-datepicker/dist/react-datepicker.css';
import './Home.css';

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

type OneWayDateTime = {
  startDateTime: Date | null;
};

interface SearchFilters {
  budget: number;
  travelers: number;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [dateTimeRange, setDateTimeRange] = useState<OneWayDateTime>({
    startDateTime: setHours(setMinutes(new Date(), 0), 9)
  });
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    budget: 1500,
    travelers: 2
  });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const filterPassedTime = (time: Date) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() < selectedDate.getTime();
  };


  const handleDateTimeChange = (value: Date | null) => {
    setDateTimeRange({ startDateTime: value });
    // Reset search state when date changes
    setHasSearched(false);
    setError(null);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string | number) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset search state when filters change
    setHasSearched(false);
    setError(null);
  };

  const validateDateTime = (): string | null => {
    if (!dateTimeRange.startDateTime) {
      return 'Por favor selecciona la fecha y hora de salida';
    }
    // Permitimos buscar fechas pasadas por si los datos de prueba están en el pasado
    return null;
  };

  const searchFlights = async () => {
    const dateTimeError = validateDateTime();
    if (dateTimeError) {
      setError(dateTimeError);
      return;
    }

    if (!searchFilters.budget || searchFilters.budget < 100) {
      setError('Por favor ingresa un presupuesto válido (mínimo $100)');
      return;
    }

    if (!searchFilters.travelers || searchFilters.travelers < 1) {
      setError('El número de viajeros debe ser al menos 1');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Build inclusive datetime window for the backend for the selected day (YYYY-MM-DD HH:mm)
      const start = startOfDay(dateTimeRange.startDateTime!);
      const end = endOfDay(dateTimeRange.startDateTime!);
      const fechaInicio = format(start, 'yyyy-MM-dd HH:mm');
      const fechaFin = format(end, 'yyyy-MM-dd HH:mm');
      
      console.log(`Searching flights on ${fechaInicio.split(' ')[0]} (full day)`);
      
      // Use backend filtering for the single-day range
      const response = await api.get(`/flights?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`);
      const data = response.data as { data: Flight[] };
      const backendFilteredFlights: Flight[] = Array.isArray(data.data) ? data.data : [];
      
      console.log('Backend returned', backendFilteredFlights.length, 'flights');

      // Filter by budget and available seats (frontend filtering for non-date criteria)
      const filteredFlights = backendFilteredFlights.filter(flight => {
        const totalCost = flight.montoVuelo * searchFilters.travelers;
        const withinBudget = totalCost <= searchFilters.budget;
        const availableSeats = flight.cantidad_asientos >= searchFilters.travelers;
        
        return withinBudget && availableSeats;
      });
      
      console.log('After budget/seat filtering:', filteredFlights.length, 'flights');
      setFlights(filteredFlights);
    } catch (err: any) {
      console.error('Error fetching flights:', err);
      setError('Error al buscar vuelos. Por favor intenta de nuevo.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setDateTimeRange({ 
      startDateTime: setHours(setMinutes(new Date(), 0), 9)
    });
    setSearchFilters({ budget: 1500, travelers: 2 });
    setFlights([]);
    setHasSearched(false);
    setError(null);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const handleBookFlight = (flight: Flight) => {
    const totalPrice = flight.montoVuelo * searchFilters.travelers;
    
    // Navigate to checkout with flight data
    navigate('/checkout', {
      state: {
        flight,
        travelers: searchFilters.travelers,
        totalPrice
      }
    });
  };

  return (
    <div className="date-range-picker">
      <div className="picker-header">
        <h2>Buscar Vuelos Personalizados</h2>
        <p>Combina fechas, horarios, presupuesto y número de viajeros para encontrar vuelos perfectos</p>
      </div>

      <div className="search-form">
        {/* Date and Time Range Section */}
        <div className="form-section">
          <h3><i className="fas fa-calendar-alt"></i> Fechas y Horarios del Viaje</h3>
          <div className="datetime-inputs">
            <div className="datetime-group">
              <label>Fecha y hora de salida</label>
              <DatePicker
                selected={dateTimeRange.startDateTime}
                onChange={(date) => handleDateTimeChange(date)}
                showTimeSelect
                filterTime={filterPassedTime}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Selecciona fecha y hora de salida"
                className="datetime-picker-input"
                minDate={new Date()}
                timeCaption="Hora"
                timeIntervals={15}
              />
            </div>

          </div>
        </div>

        {/* Budget and Travelers Section */}
        <div className="form-section">
          <h3><i className="fas fa-users"></i> Detalles del Viaje</h3>
          <div className="trip-details">
            <div className="form-group">
              <label htmlFor="budget">¿Cuál es tu presupuesto total? (USD)</label>
              <div className="budget-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="budget"
                  min="100"
                  step="50"
                  value={searchFilters.budget}
                  onChange={(e) => handleFilterChange('budget', parseInt(e.target.value) || 0)}
                  placeholder="1500"
                  className="budget-input"
                />
              </div>
              <div className="budget-info">
                {searchFilters.travelers > 1 && (
                  <small>≈ {formatPrice(searchFilters.budget / searchFilters.travelers)} por persona</small>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="travelers">Número de viajeros</label>
              <select 
                id="travelers" 
                value={searchFilters.travelers}
                onChange={(e) => handleFilterChange('travelers', parseInt(e.target.value))}
                className="travelers-select"
              >
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'persona' : 'personas'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="picker-actions">
        <button 
          onClick={searchFlights}
          disabled={loading || !dateTimeRange.startDateTime || !searchFilters.budget || searchFilters.travelers < 1}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Buscando vuelos...
            </>
          ) : (
            <>
              <i className="fas fa-search"></i>
              Buscar Vuelos
            </>
          )}
        </button>

        {(hasSearched || dateTimeRange.startDateTime) && (
          <button onClick={clearSearch} className="btn btn-secondary">
            <i className="fas fa-times"></i>
            Limpiar búsqueda
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {hasSearched && !loading && (
        <div className="search-results">
          <div className="results-header">
            <h3>
              <i className="fas fa-plane"></i>
              {flights.length === 0 
                ? 'No se encontraron vuelos' 
                : `${flights.length} vuelo${flights.length !== 1 ? 's' : ''} encontrado${flights.length !== 1 ? 's' : ''}`
              }
            </h3>
            <div className="search-criteria">
              {dateTimeRange.startDateTime && (
                <div className="criterion">
                  <i className="fas fa-calendar-check"></i>
                  <span>
                    El {formatDateTime(dateTimeRange.startDateTime)}
                  </span>
                </div>
              )}
              <div className="criterion">
                <i className="fas fa-dollar-sign"></i>
                <span>Presupuesto: {formatPrice(searchFilters.budget)}</span>
              </div>
              <div className="criterion">
                <i className="fas fa-users"></i>
                <span>{searchFilters.travelers} {searchFilters.travelers === 1 ? 'viajero' : 'viajeros'}</span>
              </div>
            </div>
          </div>

          {flights.length === 0 ? (
            <div className="no-flights">
              <i className="fas fa-plane-slash"></i>
              <h4>No hay vuelos disponibles</h4>
              <p>No se encontraron vuelos para el día seleccionado.</p>
              <div className="suggestions">
                <p><strong>Sugerencias:</strong></p>
                <ul>
                  <li>Considera fechas diferentes</li>
                  <li>Aumenta el presupuesto</li>
                  <li>Reduce el número de viajeros</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flights-list">
              {flights.map((flight) => (
                <div key={flight.id} className="flight-card">
                  <div className="flight-header">
                    <div className="airline">
                      <i className="fas fa-plane"></i>
                      <span>{flight.aerolinea}</span>
                    </div>
                    <div className="price">
                      <div className="total-price">{formatPrice(flight.montoVuelo * searchFilters.travelers)}</div>
                      {searchFilters.travelers > 1 && (
                        <div className="price-per-person">{formatPrice(flight.montoVuelo)} por persona</div>
                      )}
                    </div>
                  </div>

                  <div className="flight-details">
                    <div className="route">
                      <div className="departure">
                        <div className="time">{formatTime(flight.fechahora_salida)}</div>
                        <div className="location">{flight.origen}</div>
                        <div className="date">{formatDate(flight.fechahora_salida)}</div>
                      </div>
                      
                      <div className="flight-duration">
                        <div className="duration-line">
                          <div className="plane-icon">✈️</div>
                        </div>
                        <div className="duration-text">{formatDuration(flight.duracion)}</div>
                      </div>
                      
                      <div className="arrival">
                        <div className="time">{formatTime(flight.fechahora_llegada)}</div>
                        <div className="location">{flight.destino.nombre}</div>
                        <div className="date">{formatDate(flight.fechahora_llegada)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flight-footer">
                    <div className="flight-info">
                      <div className="seats-info">
                        <i className="fas fa-chair"></i>
                        <span>{flight.cantidad_asientos} asientos disponibles</span>
                      </div>
                      
                      {flight.destino.actividades && flight.destino.actividades.length > 0 && (
                        <div className="activities">
                          <i className="fas fa-map-marked-alt"></i>
                          <span>
                            Actividades: {flight.destino.actividades.slice(0, 2).join(', ')}
                            {flight.destino.actividades.length > 2 && ` +${flight.destino.actividades.length - 2} más`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="btn btn-book"
                      onClick={() => handleBookFlight(flight)}
                    >
                      <i className="fas fa-ticket-alt"></i>
                      Reservar Ahora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};