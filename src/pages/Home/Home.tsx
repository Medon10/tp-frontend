import './Home.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../components/layout/Notification';

export interface Destino {
  id: number;
  nombre: string;
  transporte: string[];
  actividades: string[];
  imagen: string;
}

interface Vuelo {
  id: number;
  origen: string;
  destino: {
    id: number;
    nombre: string;
    imagen: string;
    transporte: string[];
    actividades: string[];
  };
  fecha_hora: string;
  capacidad_restante: number;
  precio_por_persona: number;
  precio_total: number;
  personas: number;
  distancia_aproximada: number;
}

interface ResultadosBusqueda {
  message: string;
  resultados: number;
  presupuesto_maximo: number;
  personas: number;
  origen: string;
  data: Vuelo[];
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    presupuesto: '',
    personas: '1',
    origen: 'Buenos Aires',
    fecha_salida: ''
  });

  const [resultados, setResultados] = useState<ResultadosBusqueda | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [ciudadesOrigen, setCiudadesOrigen] = useState<Destino[]>([]);

  useEffect(() => {
    const fetchCiudades = async () => {
      try {
        const response = await axios.get<{ data: Destino[] }>('/api/destinies');
        setCiudadesOrigen(response.data.data || []);
      } catch (err) {
        console.error("Error al cargar las ciudades de origen", err);
      }
    };
    fetchCiudades();
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.presupuesto || Number(formData.presupuesto) <= 0) {
      setError('Ingresa un presupuesto válido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post<ResultadosBusqueda>(
        '/api/flights/buscar',
        {
          presupuesto: Number(formData.presupuesto),
          personas: Number(formData.personas),
          origen: formData.origen,
          fecha_salida: formData.fecha_salida || undefined
        },
        { withCredentials: true }
      );

      setResultados(response.data);
    } catch (error: any) {
      console.error('Error al buscar vuelos:', error);
      setError(error.response?.data?.message || 'Error al buscar vuelos. Intenta de nuevo.');
      setResultados(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserve = async (vuelo: Vuelo) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const response = await axios.post<{ message: string }>('/api/reservations', {
        flight_id: vuelo.id,
        personas: Number(formData.personas),
      }, { withCredentials: true });
      setNotification({ message: response.data.message, type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.response?.data?.message || 'Error al procesar la reserva.', type: 'error' });
    }
  };


  const formatearPrecio = (precio: number): string => {
    return precio.toLocaleString('es-AR');
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getImageUrl = (imagen: string | null | undefined): string => {
    if (!imagen) {
      return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop';
    }
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    return `/uploads/destinos/${imagen.split('/').pop()}`;
  };

  return (
    <>
      <main className="container">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        <section className="hero">
          <h1>Vacation Match</h1>
          <p>
            Ingresa un presupuesto y te mostraremos las mejores opciones para tus vacaciones.
          </p>
        </section>

        <section className="budget-form">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="presupuesto">¿Cuál es tu presupuesto? (USD)</label>
              <input
                type="number"
                id="presupuesto"
                min="300"
                required
                placeholder="Ej: 1500"
                value={formData.presupuesto}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="personas">Número de personas</label>
              <select 
                id="personas" 
                required
                value={formData.personas}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value="1">1 persona</option>
                <option value="2">2 personas</option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="origen">Ciudad de Origen</label>
              <select 
                id="origen" 
                required
                value={formData.origen}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                {ciudadesOrigen.map(ciudad => (
                  <option key={ciudad.id} value={ciudad.nombre}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha_salida">Fecha de Salida (Opcional)</label>
              <input
                type="date"
                id="fecha_salida"
                value={formData.fecha_salida}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Buscando...' : 'Encontrar mi Destino'}
            </button>
          </form>
        </section>

        <div className="loading" style={{ display: isLoading ? 'block' : 'none' }}>
          <div className="loading-spinner"></div>
          <p>Buscando las mejores opciones para ti...</p>
        </div>

        {resultados && resultados.data.length > 0 && (
          <section className="results">
            <h2>Destinos recomendados para tu presupuesto</h2>
            <div className="packages">
              {resultados.data.map((vuelo) => (
                <div key={vuelo.id} className="package-card">
                  <div 
                    className="package-image"
                    style={{ backgroundImage: `url(${getImageUrl(vuelo.destino.imagen)})` }}
                  ></div>
                  <div className="package-content">
                    <h3 className="package-title">{vuelo.destino.nombre}</h3>
                    <p className="package-price">${formatearPrecio(vuelo.precio_total)} USD</p>
                    <div className="package-details">
                      <div className="package-detail">
                        <i className="fas fa-plane-departure"></i>
                        <span>Desde {vuelo.origen}</span>
                      </div>
                      <div className="package-detail">
                        <i className="fas fa-calendar"></i>
                        <span>{formatearFecha(vuelo.fecha_hora)}</span>
                      </div>
                      <div className="package-detail">
                        <i className="fas fa-users"></i>
                        <span>{vuelo.personas} pasajero{vuelo.personas > 1 ? 's' : ''}</span>
                      </div>
                      <div className="package-detail">
                        <i className="fas fa-dollar-sign"></i>
                        <span>${formatearPrecio(vuelo.precio_por_persona)} USD/persona</span>
                      </div>
                      {vuelo.destino.actividades && vuelo.destino.actividades.length > 0 && (
                        <div className="package-detail">
                          <i className="fas fa-star"></i>
                          <span>{vuelo.destino.actividades.slice(0, 2).join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="package-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={() => navigate(`/destinos/${vuelo.destino.id}`)}
                      >
                        Ver Detalles
                      </button>
                      <button 
                        className="btn"
                        onClick={() => handleReserve(vuelo)}
                        disabled={!vuelo.capacidad_restante || vuelo.capacidad_restante <= 0}
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {resultados && resultados.data.length === 0 && !isLoading && (
          <section className="results">
            <h2>No encontramos vuelos disponibles</h2>
            <p style={{ textAlign: 'center', color: '#666' }}>
              Intenta ajustar tu presupuesto o cambiar la fecha de salida.
            </p>
          </section>
        )}

        <section className="features">
          <div className="feature">
            <i className="fas fa-globe"></i>
            <h3>Destinos Globales</h3>
          </div>
          <div className="feature">
            <i className="fas fa-hand-holding-usd"></i>
            <h3>Mejor Precio Garantizado</h3>
          </div>
          <div className="feature">
            <i className="fas fa-computer"></i>
            <h3>Planeá tu viaje</h3>
          </div>
        </section>
      </main>
    </>
  );
};