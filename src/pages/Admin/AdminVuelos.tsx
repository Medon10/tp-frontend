import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import { FlightForm } from '../../ValidateFunctions/ValidateFlightForm'; // Importa el nuevo formulario
import type { Vuelo } from './types'; // Importa los tipos

export const AdminVuelos: React.FC = () => {
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para manejar el modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vueloSeleccionado, setVueloSeleccionado] = useState<Vuelo | null>(null);

  useEffect(() => {
    fetchVuelos();
  }, []);

  const fetchVuelos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/flights', { withCredentials: true });
      setVuelos((response.data as { data: Vuelo[] }).data || []);
    } catch (err) {
      setError('No se pudieron cargar los vuelos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para manejar el modal
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
    fetchVuelos(); // Refresca la lista de vuelos después de guardar
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Seguro que quieres eliminar este vuelo?')) {
      try {
        await axios.delete(`/api/flights/${id}`, { withCredentials: true });
        fetchVuelos(); // Refresca la lista
      } catch (error) {
        alert('Error al eliminar el vuelo.');
      }
    }
  };

  if (isLoading) return <div className="container">Cargando...</div>;
  if (error) return <div className="container error-message">{error}</div>;

  return (
    <main className="container admin-page">
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

      {/* El Modal del Formulario */}
      {isFormOpen && (
        <FlightForm
          vueloAEditar={vueloSeleccionado}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCerrarForm}
        />
      )}
    </main>
  );
};