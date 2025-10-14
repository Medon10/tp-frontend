// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout, loading } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDropdownToggle = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleDropdownItemClick = (action: () => void) => {
        setIsDropdownOpen(false);
        action();
    };

    const handleProfileClick = () => {
        navigate('/perfil');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleNavigation = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate(path);
    };

    return (
        <header>
            <div className="container">
                <nav>
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <i className="fas fa-umbrella-beach"></i>
                        VM
                    </div>
                    <div className="nav-links">
                        <a href="#" onClick={handleNavigation('/')}>Inicio</a>
                        <a href="#" onClick={handleNavigation('/destinos')}>Destinos</a>
                        
                        {loading ? (
                            <span className="loading-text">
                                <i className="fas fa-spinner fa-spin"></i> Cargando...
                            </span>
                        ) : (
                            <div className="user-dropdown" ref={dropdownRef}>
                                <a 
                                    href="#" 
                                    onClick={handleDropdownToggle}
                                    className={`dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                                >
                                    <i className="fas fa-user"></i>
                                    {isAuthenticated ? (
                                        <>
                                            {user?.nombre || 'Mi perfil'}
                                            <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownOpen ? 'rotated' : ''}`}></i>
                                        </>
                                    ) : (
                                        <>
                                            Mi perfil
                                            <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownOpen ? 'rotated' : ''}`}></i>
                                        </>
                                    )}
                                </a>
                                
                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        {isAuthenticated ? (
                                            // Menú para usuario autenticado
                                            <>
                                                <div className="dropdown-header">
                                                    <div className="user-info">
                                                        <i className="fas fa-user-circle"></i>
                                                        <div>
                                                            <div className="user-name">
                                                                {user?.nombre} {user?.apellido}
                                                            </div>
                                                            <div className="user-email">
                                                                {user?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                <a 
                                                    href="#" 
                                                    className="dropdown-item"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDropdownItemClick(handleProfileClick);
                                                    }}
                                                >
                                                    <i className="fas fa-user"></i>
                                                    Mi Perfil
                                                </a>
                                                <a 
                                                    href="#" 
                                                    className="dropdown-item"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDropdownItemClick(() => navigate('/mis-viajes'));
                                                    }}
                                                >
                                                    <i className="fas fa-suitcase"></i>
                                                    Mis Viajes
                                                </a>
                                                <a 
                                                    href="#" 
                                                    className="dropdown-item"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDropdownItemClick(() => navigate('/favoritos'));
                                                    }}
                                                >
                                                    <i className="fas fa-heart"></i>
                                                    Favoritos
                                                </a>
                                                {user?.rol === 'admin' && (
                                                <a 
                                                    href="#" 
                                                    className="dropdown-item admin-link" // Puedes darle una clase para estilos
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDropdownItemClick(() => navigate('/admin/flights'));
                                                    }}
                                                >
                                                    <i className="fas fa-user-shield"></i>
                                                    Administración
                                                </a>
                                            )}
                                                <div className="dropdown-divider"></div>
                                                <a 
                                                    href="#" 
                                                    className="dropdown-item logout-item"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDropdownItemClick(handleLogout);
                                                    }}
                                                >
                                                    <i className="fas fa-sign-out-alt"></i>
                                                    Cerrar Sesión
                                                </a>
                                            </>
                                        ) : (
                                            // Menú para usuario no autenticado
                                            <>
                                                <a 
                                                    href="#" 
                                                    className="dropdown-item login-item"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDropdownItemClick(handleLoginClick);
                                                    }}
                                                >
                                                    <i className="fas fa-sign-in-alt"></i>
                                                    Iniciar Sesión
                                                </a>
                                                <a 
                                                    href="#" 
                                                    className="dropdown-item register-item"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDropdownItemClick(handleRegisterClick);
                                                    }}
                                                >
                                                    <i className="fas fa-user-plus"></i>
                                                    Registrarse
                                                </a>
                                                <div className="dropdown-divider"></div>
                                                <div className="dropdown-info">
                                                    <small>
                                                        <i className="fas fa-info-circle"></i>
                                                        Inicia sesión para acceder a todas las funciones
                                                    </small>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};