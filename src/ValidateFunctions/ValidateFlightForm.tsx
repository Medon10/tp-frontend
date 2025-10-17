import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Vuelo } from "../pages/Admin/types"
import type { Destino } from "../pages/Admin/types"

interface FlightFormProps {
  vueloAEditar: Vuelo | null;
  onFormSubmit: () => void; // Función para refrescar la lista de vuelos
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

  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        const response = await axios.get('/api/destinies');
        const data = response.data as { data: Destino[] };
        setDestinos(data.data || []);
      } catch (err) {
        console.error("Error al cargar destinos", err);
      }
    };
    fetchDestinos();
  }, []);

  useEffect(() => {
    if (vueloAEditar) {
      setFormData({
        origen: vueloAEditar.origen,
        destino_id: String(vueloAEditar.destino.id),
        aerolinea: vueloAEditar.aerolinea,
        fechahora_salida: new Date(vueloAEditar.fechahora_salida).toISOString().slice(0, 16),
        fechahora_llegada: new Date(vueloAEditar.fechahora_llegada).toISOString().slice(0, 16),
        montoVuelo: String(vueloAEditar.montoVuelo),
        cantidad_asientos: String(vueloAEditar.cantidad_asientos),
        duracion: String(vueloAEditar.duracion),
      });
    }
  }, [vueloAEditar]);

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

    const fechaSalida = new Date(formData.fechahora_salida);
    const fechaLlegada = new Date(formData.fechahora_llegada);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

    if (fechaSalida < hoy) {
      setError('La fecha de salida no puede ser una fecha que ya ha pasado.');
      setIsLoading(false);
      return;
    }
    if (fechaLlegada <= fechaSalida) {
      setError('La fecha de llegada debe ser posterior a la fecha de salida.');
      setIsLoading(false);
      return;
    }

    const flightData = {
      origen: formData.origen,
      destino_id: Number(formData.destino_id),
      aerolinea: formData.aerolinea,
      fechahora_salida: formData.fechahora_salida,
      fechahora_llegada: formData.fechahora_llegada,
      montoVuelo: Number(formData.montoVuelo),
      cantidad_asientos: Number(formData.cantidad_asientos),
      duracion: Number(formData.duracion),
    };

    try {
      if (vueloAEditar) {
        await axios.put(`/api/flights/${vueloAEditar.id}`, flightData, { withCredentials: true });
      } else {
        await axios.post('/api/flights', flightData, { withCredentials: true });
      }
      onFormSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al guardar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{vueloAEditar ? 'Editar Vuelo' : 'Crear Nuevo Vuelo'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label>Origen</label>
            <input name="origen" value={formData.origen} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Destino</label>
            <select name="destino_id" value={formData.destino_id} onChange={handleChange} required>
              <option value="">Selecciona un destino</option>
              {destinos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>Aerolínea</label>
            <input name="aerolinea" value={formData.aerolinea} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Fecha y Hora de Salida</label>
            <input type="datetime-local" name="fechahora_salida" value={formData.fechahora_salida} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Fecha y Hora de Llegada</label>
            <input type="datetime-local" name="fechahora_llegada" value={formData.fechahora_llegada} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Precio (USD)</label>
            <input type="number" name="montoVuelo" value={formData.montoVuelo} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Asientos</label>
            <input type="number" name="cantidad_asientos" value={formData.cantidad_asientos} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Duración (minutos)</label>
            <input 
              type="number" 
              name="duracion" 
              value={formData.duracion} 
              readOnly 
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Vuelo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};