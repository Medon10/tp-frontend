import './Register.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../components/layout/Notification'; // <-- 1. IMPORTADO
import { validateEmail } from '../../ValidateFunctions/ValidateFormMail';
import { validatePasswordStrength, validatePasswordMatch } from '../../ValidateFunctions/ValidateFormPass';

type ValidationErrors = {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
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
  
  // <-- 2. NUEVO ESTADO PARA NOTIFICACIONES -->
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/perfil';

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let sanitizedValue = value;
    if (id === 'email') {
      sanitizedValue = value.trim().toLowerCase();
    } else if (id === 'nombre' || id === 'apellido') {
      sanitizedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
    }
    setFormData(prev => ({ ...prev, [id]: sanitizedValue }));
    if (errors[id as keyof ValidationErrors]) {
      const newErrors = { ...errors };
      delete newErrors[id as keyof ValidationErrors];
      setErrors(newErrors);
    }
    setNotification(null); // Limpiar notificación al escribir
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) newErrors.nombre = 'El nombre es requerido (mín. 2 caracteres)';
    if (!formData.apellido.trim() || formData.apellido.trim().length < 2) newErrors.apellido = 'El apellido es requerido (mín. 2 caracteres)';
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) newErrors.email = emailValidation.message;
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.message;
    const passwordMatchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!passwordMatchValidation.isValid) newErrors.confirmPassword = passwordMatchValidation.message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `api/users/signup`, 
        {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email,
          password: formData.password
        },
        { withCredentials: true }
      );

      // <-- 3. LÓGICA DE ÉXITO MODIFICADA -->
      if (response.status === 201) {
        setNotification({
          message: '¡Cuenta creada con éxito! Ya puedes iniciar sesión.',
          type: 'success'
        });
        // Limpiamos el formulario
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }

    } catch (error: any) {
      const defaultError = 'Error inesperado. Intenta de nuevo.';
      let errorMessage = defaultError;

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        if (status === 409) {
          errorMessage = 'Este email ya está registrado. Por favor, inicia sesión.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error.request) {
        errorMessage = 'Sin conexión al servidor. Verifica tu conexión a internet.';
      }
      
      setNotification({ message: errorMessage, type: 'error' });

    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  if (loading) {
    return (
      <main className="container"><section className="hero">
        <h1>Verificando sesión...</h1>
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      </section></main>
    );
  }

  return (
    <>
      {/* <-- 4. RENDERIZADO DE LA NOTIFICACIÓN --> */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <main className="container">
        <section className="hero">
          <h1>Crear Cuenta</h1>
          <p>Únete a VacationMatch y descubre increíbles destinos</p>
        </section>

        <section className="budget-form">
          <form onSubmit={handleSubmit}>
            {/* El formulario y sus campos no cambian, pero el error general ya no es necesario */}
            {/* ...resto del JSX del formulario sin cambios... */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre{errors.nombre && <span className="field-error"><i className="fas fa-exclamation-circle"></i>{errors.nombre}</span>}</label>
                <input type="text" id="nombre" required placeholder="Tu nombre" value={formData.nombre} onChange={handleInputChange} disabled={isLoading} className={errors.nombre ? 'error' : ''} maxLength={50} autoComplete="given-name" />
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido{errors.apellido && <span className="field-error"><i className="fas fa-exclamation-circle"></i>{errors.apellido}</span>}</label>
                <input type="text" id="apellido" required placeholder="Tu apellido" value={formData.apellido} onChange={handleInputChange} disabled={isLoading} className={errors.apellido ? 'error' : ''} maxLength={50} autoComplete="family-name" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico{errors.email && <span className="field-error"><i className="fas fa-exclamation-circle"></i>{errors.email}</span>}</label>
              <input type="email" id="email" required placeholder="tu@email.com" value={formData.email} onChange={handleInputChange} disabled={isLoading} className={errors.email ? 'error' : ''} maxLength={255} autoComplete="email" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña{errors.password && <span className="field-error"><i className="fas fa-exclamation-circle"></i>{errors.password}</span>}</label>
              <div className="password-input-wrapper">
                <input type={showPassword ? "text" : "password"} id="password" required placeholder="minimo 6 caracteres" value={formData.password} onChange={handleInputChange} disabled={isLoading} className={errors.password ? 'error' : ''} autoComplete="new-password" />
                <button type="button" className="toggle-password" onClick={togglePasswordVisibility} disabled={isLoading} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña{errors.confirmPassword && <span className="field-error"><i className="fas fa-exclamation-circle"></i>{errors.confirmPassword}</span>}</label>
              <div className="password-input-wrapper">
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" required placeholder="Confirma tu contraseña" value={formData.confirmPassword} onChange={handleInputChange} disabled={isLoading} className={errors.confirmPassword ? 'error' : ''} autoComplete="new-password" />
                <button type="button" className="toggle-password" onClick={toggleConfirmPasswordVisibility} disabled={isLoading} aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
              </div>
            </div>
            <button type="submit" className={`btn btn-full ${isLoading ? 'btn-loading' : ''}`} disabled={isLoading}>
              {isLoading ? (<><i className="fas fa-spinner fa-spin"></i>Creando cuenta...</>) : ('Crear Cuenta')}
            </button>
          </form>
        </section>

        <section className="auth-redirect">
          <p>¿Ya tienes cuenta? <a href="./login" className="link-primary">Inicia sesión aquí</a></p>
        </section>
      </main>
    </>
  );
};