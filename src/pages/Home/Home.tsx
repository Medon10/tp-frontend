import './Home.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Vuelo {
  id: number;
  origen: string;
  destino: { id: number; nombre: string; };
  fechahora_salida: string;
  precio_por_persona: number;
  aerolinea: string;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    presupuesto: '',
    personas: '1',
    origen: 'Buenos Aires',
    fecha_salida: '',
  });
  const [results, setResults] = useState<Vuelo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await axios.post('/api/flights/search', formData);
      setResults((response.data as { data: Vuelo[] }).data || []);
    } catch (err) {
      setError('No se encontraron vuelos con esos criterios.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="hero">
        <h1>Encuentra tu Vuelo Perfecto</h1>
        <p>Ingresa tus preferencias y descubre a dónde puedes viajar.</p>
      </section>

      <section className="budget-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label htmlFor="presupuesto">Presupuesto Máximo Total (USD)</label><input type="number" id="presupuesto" value={formData.presupuesto} onChange={handleInputChange} required min="1" /></div>
          <div className="form-group"><label htmlFor="personas">Cantidad de Pasajeros</label><select id="personas" value={formData.personas} onChange={handleInputChange}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} pasajero(s)</option>)}</select></div>
          <div className="form-group"><label htmlFor="origen">Ciudad de Origen</label><input type="text" id="origen" value={formData.origen} onChange={handleInputChange} required /></div>
          <div className="form-group"><label htmlFor="fecha_salida">Fecha de Salida</label><input type="date" id="fecha_salida" value={formData.fecha_salida} onChange={handleInputChange} required /></div>
          <button type="submit" className="btn btn-full" disabled={isLoading}>{isLoading ? 'Buscando...' : 'Buscar Vuelos'}</button>
        </form>
      </section>

      {isLoading && <div className="loading-spinner"></div>}
      {error && <p className="error-message">{error}</p>}
      
      {searched && !isLoading && !error && (
        <section className="results">
          <h2>Vuelos Disponibles</h2>
          {results.length > 0 ? (
            <div className="packages">
              {results.map((vuelo) => (
                <article key={vuelo.id} className="package-card">
                {/* Columna Izquierda: Información del Vuelo */}
                <div className="package-info">
                    <h3 className="package-title">{vuelo.origen} → {vuelo.destino.nombre}</h3>
                    <p className="package-detail">
                    <i className="fas fa-plane"></i> {vuelo.aerolinea || 'Aerolínea no especificada'}
                    </p>
                    <p className="package-detail">
                    <i className="fas fa-calendar-day"></i> 
                    Sale el {new Date(vuelo.fechahora_salida).toLocaleString('es-AR', { 
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false 
                    })} hs
                    </p>
                </div>

                {/* Columna Derecha: Precio y Acción */}
                <div className="package-action">
                    <div className="package-price">
                    ${vuelo.precio_por_persona.toLocaleString()}
                    <small>/ por persona</small>
                    </div>
                    <button className="btn" onClick={() => navigate(`/destinos/${vuelo.destino.id}`)}>
                    Ver Detalles
                    </button>
                </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No se encontraron vuelos para la fecha y presupuesto seleccionados.</p>
          )}
        </section>
      )}
    </main>
  );
};