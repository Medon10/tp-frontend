// src/components/layout/Footer.tsx
import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
return (
    <footer>
    <div className="container">
        <div className="footer-content">
        <div className="footer-section">
            <h3>VacationMatch</h3>
            <p>
            Tu plataforma para descubrir y reservar las vacaciones perfectas
            según tu presupuesto.
            </p>
        </div>
        <div className="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul>
            <li>
            <a href="./destinos">Destinos Populares</a>
            </li>
            <li>
            <a href="./Home">Buscar por presupuesto</a>
            </li>
            </ul>
        </div>
        <div className="footer-section">
            <h3>Soporte</h3>
            <ul>
            <li>
                <a href="#">Preguntas Frecuentes</a>
            </li>
            <li>
                <a href="#">Términos y Condiciones</a>
            </li>
            <li>
                <a href="tel: +542473464989">Telefono</a>
            </li>
            </ul>
        </div>
        <div className="footer-section">
            <h3>Síguenos</h3>
            <ul>
            <li>
                <a href="https://www.instagram.com/mateomedon_/">
                <i className="fab fa-instagram"></i> Instagram
                </a>
            </li>
            </ul>
        </div>
        </div>
        <div className="copyright">
        &copy; 2025 VacationMatch. Todos los derechos reservados.
        </div>
    </div>
    </footer>
);
};