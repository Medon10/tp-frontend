import './perfil.css';
import React, { useState } from 'react';

export const Perfil: React.FC = () => {
  const [user] = useState({
    nombre: 'Chupa Ballesteros',
    email: 'chupa@email.com',
    telefono: '+54 11 4567-8910',
    fechaRegistro: '2023-03-15',
    viajesCompletados: 2,
    proximoViaje: 'Pisos Picados',
    fechaProximoViaje: '2025-09-15'
  });

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
              <h2>¡Hola, {user.nombre}!</h2>
              <p className="user-level">
              </p>
            </div>
          </div>
        </section>

        {/* Estadísticas compactas */}
        <section className="profile-stats-compact">
          <div className="stat-item">
            <i className="fas fa-plane"></i>
            <div>
              <h3>{user.viajesCompletados}</h3>
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
              <h3>2 años</h3>
              <p>Miembro desde</p>
            </div>
          </div>
        </section>

        {/* Información personal e información compacta */}
        <div className="profile-content-grid">
          <section className="budget-form profile-form">
            <h3><i className="fas fa-user"></i> Información Personal</h3>
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                value={user.nombre}
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={user.email}
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                value={user.telefono}
                readOnly
              />
            </div>
            <button className="btn btn-outline btn-full">
              <i className="fas fa-edit"></i>
              Editar información
            </button>
          </section>

          <div className="profile-right-column">
            {/* Próximo viaje */}
            {user.proximoViaje && (
              <section className="budget-form compact-trip">
                <h3><i className="fas fa-suitcase-rolling"></i> Próximo Viaje</h3>
                <div className="next-trip">
                  <div className="trip-info">
                    <h4>{user.proximoViaje}</h4>
                    <p><i className="fas fa-calendar"></i> {new Date(user.fechaProximoViaje).toLocaleDateString('es-ES', { 
                      day: 'numeric',
                      month: 'short'
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

              <button className="action-btn-beautiful history">
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
              <button className="btn btn-outline btn-logout">
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