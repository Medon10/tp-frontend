import './perfil.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Perfil: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  

  const [userStats] = useState({
    fechaRegistro: '2023-03-15',
    viajesCompletados: 2,
    proximoViaje: 'Beijing, China',
    fechaProximoViaje: '2025-09-15'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Aquí podrías implementar la lógica de edición
  };

  const calculateMembershipYears = () => {
    const registrationDate = new Date(userStats.fechaRegistro);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - registrationDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears || 1;
  };

  // Si no hay usuario (no debería pasar por ProtectedRoute, pero por seguridad)
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

  return (
    <>
      <main className="container">
        {/* Header principal con información del usuario */}
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
                <i className="fas fa-star"></i> Miembro VIP
              </p>
            </div>
          </div>
        </section>

        {/* Estadísticas compactas */}
        <section className="profile-stats-compact">
          <div className="stat-item">
            <i className="fas fa-plane"></i>
            <div>
              <h3>{userStats.viajesCompletados}</h3>
              <p>Viajes completados</p>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-calendar-check"></i>
            <div>
              <h3>1</h3>
              <p>Próximo viaje</p>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-clock"></i>
            <div>
              <h3>{calculateMembershipYears()} años</h3>
              <p>Miembro desde</p>
            </div>
          </div>
        </section>

        {/* Información personal e información compacta */}
        <div className="profile-content-grid">
          <section className="budget-form profile-form">
            <h3><i className="fas fa-user"></i> Información Personal</h3>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={user.nombre}
                readOnly={!isEditing}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                id="apellido"
                value={user.apellido}
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
                readOnly={!isEditing}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="id">ID de Usuario</label>
              <input
                type="text"
                id="id"
                value={user.id.toString()}
                readOnly
                disabled
              />
            </div>
            
            {isEditing ? (
              <div className="edit-buttons">
                <button 
                  className="btn btn-full"
                  onClick={() => setIsEditing(false)}
                >
                  <i className="fas fa-save"></i>
                  Guardar cambios
                </button>
                <button 
                  className="btn btn-outline btn-full"
                  onClick={() => setIsEditing(false)}
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

          <div className="profile-right-column">
            {/* Próximo viaje */}
            {userStats.proximoViaje && (
              <section className="budget-form compact-trip">
                <h3><i className="fas fa-suitcase-rolling"></i> Próximo Viaje</h3>
                <div className="next-trip">
                  <div className="trip-info">
                    <h4>{userStats.proximoViaje}</h4>
                    <p><i className="fas fa-calendar"></i> {new Date(userStats.fechaProximoViaje).toLocaleDateString('es-ES', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</p>
                  </div>
                  <button className="btn btn-outline btn-small">
                    <i className="fas fa-eye"></i>
                    Ver detalles
                  </button>
                </div>
              </section>
            )}

            {/* Acciones principales - Solo 2 botones bonitos */}
            <section className="profile-actions-compact">
              <button className="action-btn-beautiful favorites">
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
                onClick={() => navigate('/historial')}
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

            {/* Botón de cerrar sesión */}
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
    </>
  );
};