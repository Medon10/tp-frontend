// Re-exporta tipos desde la fuente centralizada.
// Mantiene compatibilidad con imports existentes (ej: ValidateFlightForm.tsx).
export type { Destino, VueloAdmin as Vuelo, ApiResponse } from '../../types';