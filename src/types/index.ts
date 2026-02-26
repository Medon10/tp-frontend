// ╔══════════════════════════════════════════════════════════════════╗
// ║  Tipos centralizados del dominio — frontend                    ║
// ║  Fuente única de verdad para las interfaces compartidas.       ║
// ║  Cualquier componente/página debe importar de aquí.            ║
// ╚══════════════════════════════════════════════════════════════════╝

// ── Entidades de dominio ─────────────────────────────────────────

/** Destino turístico */
export interface Destino {
  id: number;
  nombre: string;
  imagen?: string;
  transporte?: string[];
  actividades?: string[];
}

/**
 * Vuelo — tipo base de la entidad.
 * Los campos de la BD son requeridos; los calculados por la API son opcionales.
 */
export interface Vuelo {
  id: number;
  origen: string;
  destino: Destino;
  fechahora_salida: string;
  fechahora_llegada: string;
  duracion: number;
  aerolinea: string;
  cantidad_asientos: number;
  capacidad_restante: number;
  montoVuelo: number;
  distancia_km?: number;
  // Campos calculados por la API (presentes en findByDestino y favoritos)
  precio_por_persona?: number;
  distancia_aproximada?: number;
}

/**
 * Resultado individual de búsqueda (POST /flights/buscar).
 * Tiene campos exclusivos como precio_total y personas.
 */
export interface VueloBusqueda {
  id: number;
  origen: string;
  destino: Destino;
  fecha_hora: string;
  capacidad_restante: number;
  precio_por_persona: number;
  precio_total: number;
  personas: number;
  distancia_aproximada: number;
}

/** Wrapper de la respuesta del endpoint de búsqueda */
export interface ResultadosBusqueda {
  message: string;
  resultados: number;
  presupuesto_maximo: number;
  personas: number;
  origen: string;
  data: VueloBusqueda[];
}

/**
 * Vuelo en el contexto del panel admin (CRUD).
 * Tiene destino_id para formularios y campos opcionales para creación.
 */
export interface VueloAdmin {
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

// ── Reservas ─────────────────────────────────────────────────────

/** Reserva con datos del vuelo embebidos (GET /reservations/user) */
export interface Reserva {
  id: number;
  fecha_reserva: string;
  valor_reserva: number;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  cantidad_personas?: number;
  flight: {
    id: number;
    origen: string;
    fechahora_salida: string;
    fechahora_llegada: string;
    aerolinea: string;
    destino: Pick<Destino, 'id' | 'nombre' | 'imagen'>;
  };
}

// ── Usuarios ─────────────────────────────────────────────────────

/** Usuario autenticado (sin contraseña) */
export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'cliente' | 'admin';
}

/** Estadísticas del perfil (GET /users/profile/stats) */
export interface UserStats {
  viajesCompletados: number;
  proximosViajes: number;
  proximoViaje: {
    id: number;
    destino: string;
    fecha_vuelo: string;
    precio_total: number;
  } | null;
  miembroDesde: string;
  aniosComoMiembro: string;
  aniosNumerico?: number;
}

// ── Favoritos ────────────────────────────────────────────────────

/** Favorito con vuelo completo (GET /favorites/user) */
export interface FavoritoCompleto {
  id: number;
  fecha_guardado: string;
  vuelo: Vuelo;
}

// ── Validación y utilidades ──────────────────────────────────────

/** Resultado de funciones de validación de formulario */
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/** Respuesta genérica de la API */
export interface ApiResponse {
  message: string;
}
