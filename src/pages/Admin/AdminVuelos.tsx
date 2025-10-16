import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import { FlightForm } from '../../ValidateFunctions/ValidateFlightForm';
import type { Vuelo } from './types';
import { ConfirmationModal } from '../../components/layout/ConfirmationModal';
import { Notification } from '../../components/layout/Notification';

// La interfaz se declara aquí...
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
    try {
      const response = await axios.get<{ data: Vuelo[] }>('/api/flights', { withCredentials: true });
      setVuelos(response.data.data || []);
    } catch (err) {
      setError('No se pudieron cargar los vuelos.');
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
  };

  const handleFormSubmit = () => {
    handleCerrarForm();
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
      // ...y se usa aquí para definir el tipo de la respuesta.
      const response = await axios.delete<ApiResponse>(`/api/flights/${flightToDelete}`, { withCredentials: true });
      setNotification({ message: response.data.message, type: 'success' });
      fetchVuelos();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Y también se usa aquí para interpretar la respuesta de error.
        const errorMessage = (error.response.data as ApiResponse)?.message || 'Error al eliminar el vuelo.';
        setNotification({ message: errorMessage, type: 'error' });
      } else {
        setNotification({ message: 'Ocurrió un error inesperado.', type: 'error' });
      }
    } finally {
      setFlightToDelete(null);
    }
  };

  if (isLoading) return <div className="container">Cargando...</div>;
  if (error) return <div className="container error-message">{error}</div>;

  return (
    <main className="container admin-page">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      <h1>Panel de Administración de Vuelos</h1>
      <button className="btn btn-primary" onClick={handleOpenFormParaCrear}>
        + Añadir Nuevo Vuelo
      </button>

      <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aerolínea</th>
              <th>Origen/Destino</th>
              <th>Salida</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vuelos.map((vuelo) => (
              <tr key={vuelo.id}>
                <td>{vuelo.id}</td>
                <td>{vuelo.aerolinea}</td>
                <td>{vuelo.origen} → {vuelo.destino?.nombre || 'N/A'}</td>
                <td>{new Date(vuelo.fechahora_salida).toLocaleString('es-AR')}</td>
                <td>${vuelo.montoVuelo}</td>
                <td className="actions">
                  <button className="btn btn-outline" onClick={() => handleOpenFormParaEditar(vuelo)}>Editar</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(vuelo.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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