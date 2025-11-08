import './Destinos.css';
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Destino {
  id: number;
  nombre: string;
  transporte: string[];
  actividades: string[];
  imagen: string;
}

export const Destinos: React.FC = () => {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const destinosPerPage = 9; // 3x3 grid

  useEffect(() => {
    fetchDestinos();
  }, []);

  const navigate = useNavigate();
  
  const fetchDestinos = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get('/destinies', {
        timeout: 10000,
      });

      console.log('Destinos recibidos:', response.data);

      const data = response.data as { data: Destino[] };
      if (data.data) {
        setDestinos(data.data);
      }
    } catch (error: any) {
      console.error('Error al cargar destinos:', error);
      setError('No se pudieron cargar los destinos. Intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular destinos a mostrar
  const indexOfLastDestino = currentPage * destinosPerPage;
  const indexOfFirstDestino = indexOfLastDestino - destinosPerPage;
  const currentDestinos = destinos.slice(indexOfFirstDestino, indexOfLastDestino);

  // Calcular número total de páginas
  const totalPages = Math.ceil(destinos.length / destinosPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getImageUrl = (imagen: string | null | undefined): string => {
    if (!imagen) {
      return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop`;
    }
    
    // Si la imagen ya es una URL completa (http/https), devolverla tal cual
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    
    // Si es una ruta relativa, construir la URL completa del backend
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const backendOrigin = apiUrl.replace(/\/?api\/?$/, '');
    return `${backendOrigin}${imagen}`;
  };

  if (isLoading) {
    return (
      <main className="container">
        <section className="hero">
          <h1>Cargando destinos...</h1>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <section className="hero">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
          <button className="btn" onClick={fetchDestinos}>
            Intentar de nuevo
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="destinos-page">
      <section className="destinos-hero">
        <div className="container">
          <h1>Descubre tu próximo destino</h1>
          <p>Explora los lugares más increíbles del mundo</p>
          <div className="destinos-stats">
            <div className="stat">
              <i className="fas fa-globe-americas"></i>
              <span>{destinos.length} destinos</span>
            </div>
            <div className="stat">
              <i className="fas fa-star"></i>
              <span>Experiencias únicas</span>
            </div>
          </div>
        </div>
      </section>

      <section className="destinos-content">
        <div className="container">
          {currentDestinos.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-map-marked-alt"></i>
              <h2>No hay destinos disponibles</h2>
              <p>Pronto agregaremos nuevos destinos increíbles</p>
            </div>
          ) : (
            <>
              <div className="destinos-grid">
                {currentDestinos.map((destino) => (
                  <article key={destino.id} className="destino-card">
                    <div 
                      className="destino-image"
                      style={{ backgroundImage: `url(${getImageUrl(destino.imagen)})` }}
                    >
                      <div className="destino-overlay">
                      </div>
                    </div>
                    
                    <div className="destino-content">
                      <h2 className="destino-title">{destino.nombre}</h2>
                      
                      {destino.transporte && destino.transporte.length > 0 && (
                        <div className="destino-info">
                          <div className="info-label">
                            <i className="fas fa-bus"></i>
                            <span>Transporte</span>
                          </div>
                          <div className="info-tags">
                            {destino.transporte.slice(0, 3).map((transport, index) => (
                              <span key={index} className="tag tag-transport">
                                {transport}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {destino.actividades && destino.actividades.length > 0 && (
                        <div className="destino-info">
                          <div className="info-label">
                            <i className="fas fa-hiking"></i>
                            <span>Actividades</span>
                          </div>
                          <div className="info-tags">
                            {destino.actividades.slice(0, 3).map((actividad, index) => (
                              <span key={index} className="tag tag-activity">
                                {actividad}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="destino-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate(`/destinos/${destino.id}`)}
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                        onClick={() => handlePageChange(number)}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}

              <div className="pagination-info">
                Mostrando {indexOfFirstDestino + 1}-{Math.min(indexOfLastDestino, destinos.length)} de {destinos.length} destinos
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to action */}
      <section className="destinos-cta">
        <div className="container">
          <div className="cta-content">
            <h2>¿No encuentras lo que buscas?</h2>
            <p>Explora nuestra herramienta de búsqueda personalizada</p>
            <button 
              className="btn btn-large"
              onClick={() => window.location.href = '/'}
            >
              Buscar por presupuesto
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};