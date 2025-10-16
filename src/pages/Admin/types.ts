export interface Destino {
  id: number;
  nombre: string;
  transporte: string[];
  actividades: string[];
  imagen: string;
}

export interface Vuelo {
  id: number;
  aerolinea: string;
  origen: string;
  destino: Destino;
  fechahora_salida: string;
  fechahora_llegada: string;
  montoVuelo: number;
  cantidad_asientos: number;
  duracion: number;
  capacidad_restante?: number;
}