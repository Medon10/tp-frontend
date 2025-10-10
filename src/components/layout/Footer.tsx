import React from 'react';
import './Footer.css'; // <-- AÑADE ESTA LÍNEA

export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="container">
        {/* Tu JSX actual del footer no necesita cambios */}
        <div className="footer-content">
          <div className="footer-section">
            <h3>VacationMatch</h3>
            <p>
              Tu plataforma para descubrir y reservar las vacaciones perfectas
              según tu presupuesto.
            </p>
          </div>
          {/* ... etc ... */}
        </div>
        <div className="copyright">
          &copy; 2025 VacationMatch. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};