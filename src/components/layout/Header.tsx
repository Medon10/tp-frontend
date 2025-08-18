// src/components/layout/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/perfil');
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <header>
            <div className="container">
                <nav>
                    <div className="logo">
                        <i className="fas fa-umbrella-beach"></i>
                        VM
                    </div>
                    <div className="nav-links">
                        <a href="#" onClick={handleHomeClick}>Inicio</a>
                        <a href="#">Destinos</a>
                        <a href="#">Ofertas</a>
                        <a href="#" onClick={handleProfileClick}>Mi perfil</a>
                    </div>
                </nav>
            </div>
        </header>
    );
};