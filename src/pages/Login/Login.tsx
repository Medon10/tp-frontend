import './Login.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta de donde venía el usuario
  const from = location.state?.from?.pathname || '/perfil';

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Llamada real a tu API
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: true // Para manejar cookies/sessions
      });

      if (response.status === 200 && response.data) {
        // Usar los datos del usuario para actualizar el contexto
        const userData = {
          email: response.data.email,
          id: response.data.id,
          nombre: response.data.nombre,
          apellido: response.data.apellido
        };

        login(userData);
        // La navegación se maneja en el useEffect
      }
    } catch (error: any) {
      console.error('Error durante el login:', error);
      
      if (error.response) {
        // El servidor respondió con un error
        switch (error.response.status) {
          case 401:
            setError('Credenciales incorrectas. Verifica tu email y contraseña.');
            break;
          case 404:
            setError('Usuario no encontrado.');
            break;
          case 500:
            setError('Error del servidor. Intenta más tarde.');
            break;
          default:
            setError('Error de autenticación. Intenta de nuevo.');
        }
      } else if (error.request) {
        // Fallback a login simulado para desarrollo
        console.log('No se pudo conectar al servidor, usando login simulado');
        
        // Login simulado (remover cuando tengas backend)
        if (formData.email === 'admin@test.com' && formData.password === '123456') {
          const mockUser = {
            email: formData.email,
            id: 1,
            nombre: 'Usuario',
            apellido: 'Demo'
          };
          login(mockUser);
        } else {
          setError('Credenciales incorrectas. Intenta con admin@test.com / 123456');
        }
      } else {
        setError('Error inesperado. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <main className="container">
        <section className="hero">
          <h1>Verificando sesión...</h1>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="container">
        <section className="hero">
          <h1>Iniciar Sesión</h1>
          <p>
            Accede a tu cuenta de VacationMatch para gestionar tus viajes
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
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                required
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                required
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-full ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
            
            <div className="form-links">
              <a href="#" className="link">¿Olvidaste tu contraseña?</a>
            </div>
          </form>
        </section>

        <section className="auth-options">
          <div className="auth-divider">
            <span>o</span>
          </div>
          
          <div className="social-login">
            <button className="btn btn-outline btn-google" type="button">
              <i className="fab fa-google"></i>
              Continuar con Google
            </button>
            <button className="btn btn-outline btn-facebook" type="button">
              <i className="fab fa-facebook-f"></i>
              Continuar con Facebook
            </button>
          </div>
        </section>

        <section className="auth-redirect">
          <p>¿No tienes cuenta? <a href="./register" className="link-primary">Regístrate aquí</a></p>
        </section>

        <section className="features">
          <div className="feature">
            <i className="fas fa-shield-alt"></i>
            <h3>Seguridad Garantizada</h3>
            <p>
              Tus datos están protegidos con encriptación de última generación.
            </p>
          </div>
          <div className="feature">
            <i className="fas fa-clock"></i>
            <h3>Acceso 24/7</h3>
            <p>
              Gestiona tus viajes en cualquier momento desde cualquier dispositivo.
            </p>
          </div>
          <div className="feature">
            <i className="fas fa-heart"></i>
            <h3>Favoritos Guardados</h3>
            <p>
              Mantén tus destinos favoritos sincronizados en todos tus dispositivos.
            </p>
          </div>
        </section>
      </main>

      {/* Demo credentials banner */}
      <div className="demo-credentials">
        <i className="fas fa-info-circle"></i>
        <span><strong>Demo:</strong> admin@test.com / 123456</span>
      </div>
    </>
  );
};