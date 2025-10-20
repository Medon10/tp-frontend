import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css'; // Crearemos este archivo ahora

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="container unauthorized-page">
      <section className="hero">
        <div className="unauthorized-content">
          {/* Un ícono de advertencia */}
          <i className="fas fa-exclamation-triangle unauthorized-icon"></i>
          
          <h1>Acceso Denegado</h1>
          
          <p>
            No tienes los permisos de administrador necesarios para acceder a esta página.
          </p>
          
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </section>
    </main>
  );
};