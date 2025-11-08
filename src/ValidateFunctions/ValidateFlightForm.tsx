import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Vuelo } from "../pages/Admin/types"
import type { Destino } from "../pages/Admin/types"

interface FlightFormProps {
  vueloAEditar: Vuelo | null;
  onFormSubmit: (message?: string, type?: 'success' | 'error') => void;
  onCancel: () => void;
}

export const FlightForm: React.FC<FlightFormProps> = ({ vueloAEditar, onFormSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    origen: '',
    destino_id: '',
    aerolinea: '',
    fechahora_salida: '',
    fechahora_llegada: '',
    montoVuelo: '',
    cantidad_asientos: '',
    duracion: '0',
  });
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar destinos para el <select>
  useEffect(() => {
    const fetchDestinos = async () => {
      try {
  const response = await api.get('/destinies');
  const data = response.data as { data: Destino[] };
        setDestinos(data.data || []);
      } catch (err) {
        console.error("Error al cargar destinos", err);
      }
    };
    fetchDestinos();
  }, []);

  // Si estamos editando, llenar el formulario con los datos del vuelo
  useEffect(() => {
    if (vueloAEditar) {
      setFormData({
        origen: vueloAEditar.origen,
        destino_id: String(vueloAEditar.destino?.id || vueloAEditar.destino_id || ''),
        aerolinea: vueloAEditar.aerolinea,
        fechahora_salida: new Date(vueloAEditar.fechahora_salida).toISOString().slice(0, 16),
        fechahora_llegada: new Date(vueloAEditar.fechahora_llegada).toISOString().slice(0, 16),
        montoVuelo: String(vueloAEditar.montoVuelo),
        cantidad_asientos: String(vueloAEditar.cantidad_asientos),
        duracion: String(vueloAEditar.duracion),
      });
    }
  }, [vueloAEditar]);

  // Hook para calcular la duración automáticamente
  useEffect(() => {
    if (formData.fechahora_salida && formData.fechahora_llegada) {
        const salida = new Date(formData.fechahora_salida);
        const llegada = new Date(formData.fechahora_llegada);

        if (llegada > salida) {
            const diffMs = llegada.getTime() - salida.getTime();
            const diffMins = Math.round(diffMs / 60000);
            setFormData(prev => ({ ...prev, duracion: String(diffMins) }));
        } else {
            setFormData(prev => ({ ...prev, duracion: '0' }));
        }
    }
  }, [formData.fechahora_salida, formData.fechahora_llegada]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const flightData = {
      ...formData,
      destino_id: Number(formData.destino_id),
      montoVuelo: Number(formData.montoVuelo),
      cantidad_asientos: Number(formData.cantidad_asientos),
      duracion: Number(formData.duracion),
    };

    try {
      if (vueloAEditar) {
        // Edición
        await api.put(
          `/api/flights/${vueloAEditar.id}`, 
          flightData, 
          { withCredentials: true }
        );
        onFormSubmit('Vuelo actualizado exitosamente', 'success');
      } else {
        // Creación
        await api.post(
          '/api/flights', 
          flightData, 
          { withCredentials: true }
        );
        onFormSubmit('Vuelo creado exitosamente', 'success');
      }
    } catch (err: any) {
      console.error("Error al guardar el vuelo:", err);
      const errorMessage = err.response?.data?.message || 'Ocurrió un error al guardar el vuelo';
      setError(errorMessage);
      onFormSubmit(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{vueloAEditar ? 'Editar Vuelo' : 'Crear Nuevo Vuelo'}</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="origen">
              <i className="fas fa-plane-departure"></i>
              Origen
            </label>
            <input 
              id="origen"
              name="origen" 
              value={formData.origen} 
              onChange={handleChange} 
              required 
              placeholder="Ej: Buenos Aires"
            />
          </div>

          <div className="form-group">
            <label htmlFor="destino_id">
              <i className="fas fa-map-marker-alt"></i>
              Destino
            </label>
            <select 
              id="destino_id"
              name="destino_id" 
              value={formData.destino_id} 
              onChange={handleChange} 
              required
            >
              <option value="">Selecciona un destino</option>
              {destinos.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="aerolinea">
              <i className="fas fa-plane"></i>
              Aerolínea
            </label>
            <input 
              id="aerolinea"
              name="aerolinea" 
              value={formData.aerolinea} 
              onChange={handleChange} 
              required 
              placeholder="Ej: Aerolíneas Argentinas"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechahora_salida">
                <i className="fas fa-calendar-alt"></i>
                Fecha y Hora de Salida
              </label>
              <input 
                id="fechahora_salida"
                type="datetime-local" 
                name="fechahora_salida" 
                value={formData.fechahora_salida} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechahora_llegada">
                <i className="fas fa-calendar-check"></i>
                Fecha y Hora de Llegada
              </label>
              <input 
                id="fechahora_llegada"
                type="datetime-local" 
                name="fechahora_llegada" 
                value={formData.fechahora_llegada} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="montoVuelo">
                <i className="fas fa-dollar-sign"></i>
                Precio (USD)
              </label>
              <input 
                id="montoVuelo"
                type="number" 
                name="montoVuelo" 
                value={formData.montoVuelo} 
                onChange={handleChange} 
                required 
                min="0"
                step="0.01"
                placeholder="Ej: 450"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cantidad_asientos">
                <i className="fas fa-users"></i>
                Asientos
              </label>
              <input 
                id="cantidad_asientos"
                type="number" 
                name="cantidad_asientos" 
                value={formData.cantidad_asientos} 
                onChange={handleChange} 
                required 
                min="1"
                placeholder="Ej: 150"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="duracion">
              <i className="fas fa-clock"></i>
              Duración (minutos) - Calculado automáticamente
            </label>
            <input 
              id="duracion"
              type="number" 
              name="duracion" 
              value={formData.duracion} 
              readOnly 
              style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            />
            {formData.duracion !== '0' && (
              <small style={{ color: '#666', marginTop: '0.3rem', display: 'block' }}>
                {Math.floor(Number(formData.duracion) / 60)}h {Number(formData.duracion) % 60}m
              </small>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onCancel} 
              disabled={isLoading}
            >
              <i className="fas fa-times"></i>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Guardar Vuelo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};