import './Login.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../ValidateFunctions/ValidateFormMail';
import { validatePassword } from '../../ValidateFunctions/ValidateFormPass';

type ValidationErrors = {
  email?: string;
  password?: string;
};

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, loading, loginLoading, loginError } = useAuth();
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

    setErrors({});
    await login(formData.email, formData.password);
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
            {loginError && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {loginError}
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
                disabled={loginLoading}
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
                  disabled={loginLoading}
                  className={errors.password ? 'error' : ''}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  disabled={loginLoading}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <i className={`fas fa-eye${showPassword ? '' : '-slash'}`}></i>
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-full ${loginLoading ? 'btn-loading' : ''}`}
              disabled={loginLoading}
            >
              {loginLoading ? (
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
          <p>¿No tienes cuenta? <a href="/register" className="link-primary">Regístrate aquí</a></p>
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