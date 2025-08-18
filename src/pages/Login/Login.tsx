import './Login.css';
import React, { useState } from 'react';

export const Login: React.FC = () => {
    const [formData, setFormData] = useState({
    email: '',
    password: ''
});

const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

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
      // Aquí harías la llamada a tu API del backend
      // const response = await authService.login(formData);
    
      // Simulación temporal
    console.log('Intentando login con:', formData);
    
      // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
      // Simular éxito o error
    if (formData.email === 'admin@test.com' && formData.password === '123456') {
        // Login exitoso - aquí redirigirías al dashboard
        alert('Login exitoso! Redirigiendo...');
        // window.location.href = '/dashboard';
      } else {
        setError('Credenciales incorrectas. Intenta con admin@test.com / 123456');
      }
      
    } catch (error) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
      console.error('Error de login:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <button className="btn btn-outline btn-google">
              <i className="fab fa-google"></i>
              Continuar con Google
            </button>
            <button className="btn btn-outline btn-facebook">
              <i className="fab fa-facebook-f"></i>
              Continuar con Facebook
            </button>
          </div>
        </section>

        <section className="auth-redirect">
          <p>¿No tienes cuenta? <a href="#" className="link-primary">Regístrate aquí</a></p>
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