import './Register.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../ValidateFunctions/ValidateFormMail';
import { validatePasswordStrength, validatePasswordMatch } from '../../ValidateFunctions/ValidateFormPass';

type UserData = {
  email: string;
  id: number;
  nombre: string;
  apellido: string;
};

type ValidationErrors = {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/perfil';
  const isDevelopment = window.location.hostname === 'localhost';

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Sanitizar según el campo
    let sanitizedValue = value;
    if (id === 'email') {
      sanitizedValue = value.trim().toLowerCase();
    } else if (id === 'nombre' || id === 'apellido') {
      // Solo permitir letras y espacios
      sanitizedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
    }
    
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

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = 'El nombre es demasiado largo';
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    } else if (formData.apellido.trim().length > 50) {
      newErrors.apellido = 'El apellido es demasiado largo';
    }

    // Validar email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    // Validar contraseña (usando validación fuerte para registro)
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    // Validar confirmación de contraseña
    const passwordMatchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!passwordMatchValidation.isValid) {
      newErrors.confirmPassword = passwordMatchValidation.message;
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

    console.log('Enviando registro a:', `api/users/signup`);
    console.log('Datos a enviar:', {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email,
      password: '[OCULTO]'
    });

    try {
      interface RegisterResponse {
        user?: UserData;
        message?: string;
      }

      const response = await axios.post<RegisterResponse>(
        `api/users/signup`, // Ajustar URL
        {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email,
          password: formData.password
        },
        {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Respuesta del servidor:', response.data);

      if (response.status === 201 && response.data.user) {
        const userData = response.data.user;
        login(userData);
        console.log('Registro exitoso:', userData);
      }

    } catch (error: any) {
      console.error('Error completo:', error);
      
      if (error.code === 'ECONNABORTED') {
        setErrors({ general: 'La conexión tardó demasiado. Intenta de nuevo.' });
      } else if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        console.log('Status de error:', status);
        console.log('Mensaje del servidor:', serverMessage);
        
        switch (status) {
          case 400:
            setErrors({ general: 'Datos inválidos. Por favor verifica la información.' });
            break;
          case 409:
            setErrors({ general: 'Este email ya está registrado. Inicia Sesión' });
            break;
          case 422:
            if (error.response.data.errors) {
              // Si el servidor devuelve errores específicos por campo
              const serverErrors: ValidationErrors = {};
              Object.keys(error.response.data.errors).forEach(field => {
                serverErrors[field as keyof ValidationErrors] = error.response.data.errors[field];
              });
              setErrors(serverErrors);
            } else {
              setErrors({ general: 'Error de validación. Verifica los datos ingresados.' });
            }
            break;
          case 500:
            setErrors({ general: 'Error del servidor. Intenta más tarde.' });
            break;
          default:
            setErrors({ general: serverMessage || 'Error al crear la cuenta.' });
        }
      } else if (error.request) {
        console.log('No hay respuesta del servidor');
        
        // Fallback solo en desarrollo
        if (isDevelopment) {
          console.log('Modo desarrollo: usando registro simulado');
          const mockUser: UserData = {
            email: formData.email,
            id: Math.floor(Math.random() * 1000),
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim()
          };
          login(mockUser);
        } else {
          setErrors({ 
            general: 'Sin conexión al servidor. Verifica tu conexión a internet.' 
          });
        }
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          <h1>Crear Cuenta</h1>
          <p>
            Únete a VacationMatch y descubre increíbles destinos
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
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre
                  {errors.nombre && (
                    <span className="field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.nombre}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  id="nombre"
                  required
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.nombre ? 'error' : ''}
                  maxLength={50}
                  autoComplete="given-name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="apellido">
                  Apellido
                  {errors.apellido && (
                    <span className="field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.apellido}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  id="apellido"
                  required
                  placeholder="Tu apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.apellido ? 'error' : ''}
                  maxLength={50}
                  autoComplete="family-name"
                />
              </div>
            </div>
            
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
                  placeholder="Mínimo 6 caracteres con mayúscula, minúscula y número"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.password ? 'error' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmar contraseña
                {errors.confirmPassword && (
                  <span className="field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.confirmPassword}
                  </span>
                )}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  required
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={errors.confirmPassword ? 'error' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
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
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>
        </section>

        <section className="auth-options">
          <div className="auth-divider">
            <span>o</span>
          </div>
        </section>

        <section className="auth-redirect">
          <p>¿Ya tienes cuenta? <a href="./login" className="link-primary">Inicia sesión aquí</a></p>
        </section>
      </main>

      {/* Demo info banner - solo en desarrollo */}
      {isDevelopment && (
        <div className="demo-credentials">
          <i className="fas fa-info-circle"></i>
          <span><strong>Demo:</strong> Puedes registrarte con cualquier email</span>
        </div>
      )}
    </>
  );
};