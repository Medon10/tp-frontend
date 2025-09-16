import './Register.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

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

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.trim().length < 2) {
      errors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Por favor ingresa un email válido';
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
    if (validationErrors[id]) {
      setValidationErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    setError('');
    setValidationErrors({});

    try {
      // Llamada real a tu API
      const response = await axios.post('http://localhost:3000/api/auth/user', {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password
      }, {
        withCredentials: true
      });

      if (response.status === 201 && response.data) {
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
      console.error('Error durante el registro:', error);
      
      if (error.response) {
        // El servidor respondió con un error
        switch (error.response.status) {
          case 400:
            setError('Datos inválidos. Por favor verifica la información.');
            break;
          case 409:
            setError('Este email ya está registrado. ¿Ya tienes cuenta?');
            break;
          case 422:
            if (error.response.data.errors) {
              setValidationErrors(error.response.data.errors);
            } else {
              setError('Error de validación. Verifica los datos ingresados.');
            }
            break;
          case 500:
            setError('Error del servidor. Intenta más tarde.');
            break;
          default:
            setError('Error al crear la cuenta. Intenta de nuevo.');
        }
      } else if (error.request) {
        // Fallback a registro simulado para desarrollo
        console.log('No se pudo conectar al servidor, usando registro simulado');
        
        // Registro simulado (remover cuando tengas backend)
        const mockUser = {
          email: formData.email.toLowerCase(),
          id: Math.floor(Math.random() * 1000),
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim()
        };
        login(mockUser);
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
          <h1>Crear Cuenta</h1>
          <p>
            Únete a VacationMatch y descubre increíbles destinos personalizados
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
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  required
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={validationErrors.nombre ? 'error' : ''}
                />
                {validationErrors.nombre && (
                  <span className="field-error">{validationErrors.nombre}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  required
                  placeholder="Tu apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={validationErrors.apellido ? 'error' : ''}
                />
                {validationErrors.apellido && (
                  <span className="field-error">{validationErrors.apellido}</span>
                )}
              </div>
            </div>
            
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
                className={validationErrors.email ? 'error' : ''}
              />
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={validationErrors.password ? 'error' : ''}
              />
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                required
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                className={validationErrors.confirmPassword ? 'error' : ''}
              />
              {validationErrors.confirmPassword && (
                <span className="field-error">{validationErrors.confirmPassword}</span>
              )}
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-full ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
            
            <div className="form-terms">
              <p>
                Al crear tu cuenta aceptas nuestros{' '}
                <a href="#" className="link">Términos de Servicio</a> y{' '}
                <a href="#" className="link">Política de Privacidad</a>
              </p>
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
              Registrarse con Google
            </button>
            <button className="btn btn-outline btn-facebook" type="button">
              <i className="fab fa-facebook-f"></i>
              Registrarse con Facebook
            </button>
          </div>
        </section>

        <section className="auth-redirect">
          <p>¿Ya tienes cuenta? <a href="./login" className="link-primary">Inicia sesión aquí</a></p>
        </section>

        <section className="features">
          <div className="feature">
            <i className="fas fa-user-shield"></i>
            <h3>Perfil Personalizado</h3>
            <p>
              Crea tu perfil y recibe recomendaciones adaptadas a tus gustos.
            </p>
          </div>
          <div className="feature">
            <i className="fas fa-bookmark"></i>
            <h3>Guarda Favoritos</h3>
            <p>
              Marca destinos como favoritos y accede a ellos cuando quieras.
            </p>
          </div>
          <div className="feature">
            <i className="fas fa-bell"></i>
            <h3>Alertas de Ofertas</h3>
            <p>
              Recibe notificaciones de ofertas especiales en tus destinos preferidos.
            </p>
          </div>
        </section>
      </main>

      {/* Demo info banner */}
      <div className="demo-credentials">
        <i className="fas fa-info-circle"></i>
        <span><strong>Demo:</strong> Puedes registrarte con cualquier email</span>
      </div>
    </>
  );
};