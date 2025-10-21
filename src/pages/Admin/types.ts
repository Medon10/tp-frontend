// types.ts - Interfaces para el panel de administración

export interface Destino {
  id: number;
  nombre: string;
  imagen?: string;
  transporte?: string[];
  actividades?: string[];
}

export interface Vuelo {
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
  // Puede venir como objeto completo o solo el ID
  destino?: Destino;
  destino_id?: number;
}

export interface ApiResponse {
  message: string;
}