// Ajuste de import: el archivo se llama 'Perfil.css' (mayúscula P) y en sistemas case-sensitive en build falla si se usa 'perfil.css'
import './Perfil.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface UserStats {
  viajesCompletados: number;
  proximosViajes: number;
  proximoViaje: {
    id: number;
    destino: string;
    fecha_vuelo: string;
    precio_total: number;
  } | null;
  miembroDesde: string;
  aniosComoMiembro: number;
}

export const Perfil: React.FC = () => {
  const { user, logout, updateUserContext } = useAuth();
  const navigate = useNavigate();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para edición
  const [editData, setEditData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || ''
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ data: UserStats }>(
        '/users/profile/stats'
      );
      setUserStats(response.data.data);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      setError('No se pudieron cargar las estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar: restaurar valores originales
      setEditData({
        nombre: user?.nombre || '',
        apellido: user?.apellido || ''
      });
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    setError('');
    setSuccess('');

    // Validaciones
    if (!editData.nombre.trim() || !editData.apellido.trim()) {
      setError('El nombre y apellido son obligatorios');
      return;
    }

    try {
      const response = await api.put<{ data: any }>(
        '/users/profile/update',
        {
          nombre: editData.nombre,
          apellido: editData.apellido
        }
      );

      // Actualizar contexto de autenticación
      if (updateUserContext) {
        updateUserContext(response.data.data);
      }

      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);

    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setError(error.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Si no hay usuario
  if (!user) {
    return (
      <main className="container">
        <section className="hero">
          <h1>Acceso Denegado</h1>
          <p>Debes iniciar sesión para ver tu perfil.</p>
        </section>
      </main>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <main className="container">
        <section className="hero">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      {/* Header principal */}
      <section className="profile-main-header">
        <div className="profile-welcome">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal y preferencias de viaje</p>
        </div>
        
        <div className="profile-user-card">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="profile-info">
            <h2>¡Hola, {user.nombre} {user.apellido}!</h2>
            <p className="user-level">
              <i className="fas fa-star"></i>
              Miembro desde {userStats ? formatearFecha(userStats.miembroDesde) : '...'}
            </p>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="profile-stats-compact">
        <div className="stat-item">
          <i className="fas fa-plane-arrival"></i>
          <div className="stat-content">
            <h3>{userStats?.viajesCompletados || 0}</h3>
            <p>Viajes completados</p>
          </div>
        </div>
        
        <div className="stat-item">
          <i className="fas fa-calendar-check"></i>
          <div className="stat-content">
            <h3>{userStats?.proximosViajes || 0}</h3>
            <p>{userStats?.proximosViajes === 1 ? 'Próximo viaje' : 'Próximos viajes'}</p>
          </div>
        </div>
        
        <div className="stat-item">
          <i className="fas fa-clock"></i>
          <div className="stat-content">
            <h3>{userStats?.aniosComoMiembro || 'Nuevo'}</h3>
            <p>Como miembro</p>
          </div>
        </div>
      </section>

      {/* Grid de contenido */}
      <div className="profile-content-grid">
        {/* Formulario de información personal */}
        <section className="budget-form profile-form">
          <h3><i className="fas fa-user"></i> Información Personal</h3>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={isEditing ? editData.nombre : user.nombre}
              onChange={handleInputChange}
              readOnly={!isEditing}
              disabled={!isEditing}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apellido">Apellido</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={isEditing ? editData.apellido : user.apellido}
              onChange={handleInputChange}
              readOnly={!isEditing}
              disabled={!isEditing}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={user.email}
              readOnly
              disabled
            />
            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.3rem', display: 'block' }}>
              El correo electrónico no puede modificarse
            </small>
          </div>
          
          {isEditing ? (
            <div className="edit-buttons" style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-full"
                onClick={handleSaveChanges}
              >
                <i className="fas fa-save"></i>
                Guardar cambios
              </button>
              <button 
                className="btn btn-outline btn-full"
                onClick={handleEditToggle}
              >
                <i className="fas fa-times"></i>
                Cancelar
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-outline btn-full"
              onClick={handleEditToggle}
            >
              <i className="fas fa-edit"></i>
              Editar información
            </button>
          )}
        </section>

        {/* Columna derecha */}
        <div className="profile-right-column">
          {/* Próximo viaje */}
          {userStats?.proximoViaje ? (
            <section className="budget-form compact-trip">
              <h3><i className="fas fa-suitcase-rolling"></i> Próximo Viaje</h3>
              <div className="next-trip">
                <div className="trip-info">
                  <h4>{userStats.proximoViaje.destino}</h4>
                  <p>
                    <i className="fas fa-calendar"></i> 
                    {formatearFecha(userStats.proximoViaje.fecha_vuelo)}
                  </p>
                  <p>
                    <i className="fas fa-dollar-sign"></i> 
                    ${userStats.proximoViaje.precio_total.toLocaleString('es-AR')} USD
                  </p>
                </div>
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/mis-viajes')}
                >
                  <i className="fas fa-eye"></i>
                  Ver detalles
                </button>
              </div>
            </section>
          ) : (
            <section className="budget-form compact-trip">
              <h3><i className="fas fa-suitcase-rolling"></i> Próximo Viaje</h3>
              <div className="next-trip">
                <div className="trip-info">
                  <p style={{ color: '#666', textAlign: 'center' }}>
                    No tienes viajes programados
                  </p>
                </div>
                <button 
                  className="btn"
                  onClick={() => navigate('/')}
                >
                  <i className="fas fa-search"></i>
                  Buscar vuelos
                </button>
              </div>
            </section>
          )}

          {/* Botones de acción */}
          <section className="profile-actions-compact">
            <button 
              className="action-btn-beautiful favorites"
              onClick={() => navigate('/favoritos')}
            >
              <div className="action-bg"></div>
              <div className="action-icon">
                <i className="fas fa-heart"></i>
              </div>
              <div className="action-content">
                <h4>Mis Favoritos</h4>
                <p>Destinos guardados</p>
              </div>
            </button>

              <button 
                className="action-btn-beautiful history"
                onClick={() => navigate('/mis-viajes')}
              >
                <div className="action-bg"></div>
                <div className="action-icon">
                  <i className="fas fa-history"></i>
                </div>
                <div className="action-content">
                  <h4>Historial</h4>
                  <p>Viajes anteriores</p>
                </div>
              </button>
            </section>

          {/* Cerrar sesión */}
          <section className="logout-section-compact">
            <button 
              className="btn btn-outline btn-logout"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </section>
        </div>
      </div>
    </main>
  );
};