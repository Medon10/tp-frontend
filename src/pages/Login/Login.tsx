import './Login.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../ValidateFunctions/ValidateFormMail';
import { validatePassword } from '../../ValidateFunctions/ValidateFormPass';

type UserData = {
  email: string;
  password: string;
  id: number;
  nombre: string;
  apellido: string;
  rol: 'cliente' | 'admin';
};

type ValidationErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/perfil';

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Sanitizar email (convertir a minúsculas)
    const sanitizedValue = id === 'email' ? value.trim().toLowerCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [id]: sanitizedValue
    }));

    // Limpiar errores específicos cuando el usuario escribe
    if (errors[id as keyof ValidationErrors]) {
      const newErrors = { ...errors };
      delete newErrors[id as keyof ValidationErrors];
      setErrors(newErrors);
    }

    // Limpiar error general
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validar email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    // Validar contraseña
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});


    // Debug - ver qué se está enviando
    console.log('Enviando a:', `http://localhost:3000/api/users/login`);
    console.log('Datos a enviar:', {
      email: formData.email,
      password: formData.password
    });

    try {
      interface LoginResponse {
        user?: UserData;
        message?: string;
      }

      const response = await axios.post<LoginResponse>(
        `api/users/login`,
        {
          email: formData.email,
          password: formData.password
        },
        {
          withCredentials: true,
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },  
        }
      );

      console.log('Respuesta del servidor:', response.data);

      if (response.status === 200 && response.data.user) {
        const userData = response.data.user!;
        login(userData);
        console.log('Login exitoso:', userData);
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      console.error('Error message:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        setErrors({ general: 'La conexión tardó demasiado. Intenta de nuevo.' });
      } else if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        console.log('Status de error:', status);
        console.log('Mensaje del servidor:', serverMessage);
        
        switch (status) {
          case 400:
            setErrors({ general: serverMessage || 'Datos de entrada inválidos.' });
            break;
          case 401:
            setErrors({ general: 'Email o contraseña incorrectos.' });
            break;
          case 404:
            setErrors({ general: 'Usuario no encontrado.' });
            break;
          case 429:
            setErrors({ general: 'Demasiados intentos. Intenta más tarde.' });
            break;
          case 500:
            setErrors({ general: 'Error del servidor. Intenta más tarde.' });
            break;
          default:
            setErrors({ general: serverMessage || 'Error de autenticación.' });
        }

      } else if (error.request) {
        console.log('No hay respuesta del servidor');
        console.log('Request config:', error.config);

        // Mensaje único cuando no hay respuesta del servidor o conexión
        setErrors({
          general: 'Sin conexión al servidor. Verifica la conexión a internet y al servidor.'
        });
      } else {
        setErrors({ general: 'Error inesperado. Intenta de nuevo.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
            {errors.general && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {errors.general}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">
                Correo electrónico
                {errors.email && (
                  <span className="field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.email}
                  </span>
                )}
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={errors.email ? 'error' : ''}
                maxLength={255}
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                Contraseña
                {errors.password && (
                  <span className="field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.password}
                  </span>
                )}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.password ? 'error' : ''}
                  autoComplete="current-password"
                />
              </div>
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
          </form>
        </section>

        <section className="auth-redirect">
          <p>¿No tienes cuenta? <a href="./register" className="link-primary">Regístrate aquí</a></p>
        </section>

        <section className="features">
          <div className="feature">
            <i className="fas fa-shield-alt"></i>
            <h3>Seguridad Garantizada</h3>
          </div>
          <div className="feature">
            <i className="fas fa-clock"></i>
            <h3>Acceso 24/7</h3>
          </div>
          <div className="feature">
            <i className="fas fa-heart"></i>
            <h3>Favoritos Guardados</h3>
          </div>
        </section>
      </main>
    </>
  );
};