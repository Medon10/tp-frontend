import './Admin.css';
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FlightForm } from '../../ValidateFunctions/ValidateFlightForm';
import { ConfirmationModal } from '../../components/layout/ConfirmationModal';
import { Notification } from '../../components/layout/Notification';

interface Destino {
  id: number;
  nombre: string;
  imagen?: string;
  transporte?: string[];
  actividades?: string[];
}

interface Vuelo {
  id: number;
  aerolinea: string;
  origen: string;
  fechahora_salida: string;
  fechahora_llegada: string;
  duracion: number;
  cantidad_asientos: number;
  montoVuelo: number;
  distancia_km?: number;
  capacidad_restante?: number;
  destino?: Destino;
  destino_id?: number;
}

interface ApiResponse {
  message: string;
}

export const AdminVuelos: React.FC = () => {
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vueloSeleccionado, setVueloSeleccionado] = useState<Vuelo | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchVuelos();
  }, []);

  const fetchVuelos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get<{ data: Vuelo[] }>('/flights?populate=destino');
      
      console.log('Vuelos recibidos:', response.data.data);
      setVuelos(response.data.data || []);
    } catch (err) {
      console.error('Error al cargar vuelos:', err);
      setError('No se pudieron cargar los vuelos.');
      setNotification({ 
        message: 'Error al cargar los vuelos', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFormParaCrear = () => {
    setVueloSeleccionado(null);
    setIsFormOpen(true);
  };

  const handleOpenFormParaEditar = (vuelo: Vuelo) => {
    setVueloSeleccionado(vuelo);
    setIsFormOpen(true);
  };

  const handleCerrarForm = () => {
    setIsFormOpen(false);
    setVueloSeleccionado(null);
  };

  const handleFormSubmit = (message?: string, type?: 'success' | 'error') => {
    handleCerrarForm();
    if (message && type) {
      setNotification({ message, type });
    }
    fetchVuelos();
  };

  const handleDelete = (id: number) => {
    setFlightToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!flightToDelete) return;

    setIsConfirmOpen(false);
    try {
      const response = await api.delete<ApiResponse>(
        `/flights/${flightToDelete}`
      );
      
      setNotification({ 
        message: response.data.message || 'Vuelo eliminado exitosamente', 
        type: 'success' 
      });
      
      fetchVuelos();
    } catch (error) {
      console.error('Error al eliminar vuelo:', error);
      
      if ((error as any).response) {
        const errorMessage = ((error as any).response.data as ApiResponse)?.message || 'Error al eliminar el vuelo.';
        setNotification({ message: errorMessage, type: 'error' });
      } else {
        setNotification({ message: 'Ocurrió un error inesperado.', type: 'error' });
      }
    } finally {
      setFlightToDelete(null);
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio: number): string => {
    return precio.toLocaleString('es-AR');
  };

  if (isLoading) {
    return (
      <div className="container admin-page">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando vuelos...</p>
        </div>
      </div>
    );
  }

  if (error && vuelos.length === 0) {
    return (
      <div className="container admin-page">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={fetchVuelos}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <main className="container admin-page">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="admin-header">
        <h1>Panel de Administración de Vuelos</h1>
        <button className="btn btn-primary" onClick={handleOpenFormParaCrear}>
          <i className="fas fa-plus"></i>
          Añadir Nuevo Vuelo
        </button>
      </div>

      {vuelos.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-plane-slash"></i>
          <h3>No hay vuelos registrados</h3>
          <p>Comienza agregando tu primer vuelo</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Aerolínea</th>
                <th>Origen / Destino</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Asientos</th>
                <th>Precio (USD)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vuelos.map((vuelo) => (
                <tr key={vuelo.id}>
                  <td>{vuelo.id}</td>
                  <td>
                    <i className="fas fa-plane"></i> {vuelo.aerolinea}
                  </td>
                  <td>
                    <div className="route-cell">
                      <span className="origin">{vuelo.origen}</span>
                      <i className="fas fa-arrow-right"></i>
                      <span className="destination">
                        {vuelo.destino?.nombre || vuelo.destino_id || 'Sin destino'}
                      </span>
                    </div>
                  </td>
                  <td>{formatearFecha(vuelo.fechahora_salida)}</td>
                  <td>{formatearFecha(vuelo.fechahora_llegada)}</td>
                  <td>
                    <i className="fas fa-users"></i> {vuelo.cantidad_asientos}
                  </td>
                  <td className="price-cell">
                    ${formatearPrecio(vuelo.montoVuelo)}
                  </td>
                  <td className="actions">
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => handleOpenFormParaEditar(vuelo)}
                      title="Editar vuelo"
                    >
                      <i className="fas fa-edit"></i>
                      Editar
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDelete(vuelo.id)}
                      title="Eliminar vuelo"
                    >
                      <i className="fas fa-trash"></i>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <FlightForm
          vueloAEditar={vueloSeleccionado}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCerrarForm}
        />
      )}

      {isConfirmOpen && (
        <ConfirmationModal
          message="¿Seguro que quieres eliminar este vuelo? Esta acción también eliminará todas las reservas y favoritos asociados."
          onConfirm={executeDelete}
          onCancel={() => setIsConfirmOpen(false)}
          confirmText="Sí, eliminar"
          confirmButtonClass="btn-danger"
        />
      )}
    </main>
  );
};