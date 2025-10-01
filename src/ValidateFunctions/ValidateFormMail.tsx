export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// Expresión regular para validar email (RFC 5322 simplificado)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Función principal de validación de email
 */
export const validateEmail = (email: string): ValidationResult => {
  // Limpiar espacios en blanco
  const cleanEmail = email.trim();

  // Verificar si está vacío
  if (!cleanEmail) {
    return {
      isValid: false,
      message: 'El email es requerido'
    };
  }

  // Verificar longitud máxima
  if (cleanEmail.length > 255) {
    return {
      isValid: false,
      message: 'El email es demasiado largo'
    };
  }

  // Verificar longitud mínima
  if (cleanEmail.length < 5) {
    return {
      isValid: false,
      message: 'El email es demasiado corto'
    };
  }

  // Verificar formato básico
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return {
      isValid: false,
      message: 'Formato de email inválido'
    };
  }

  // Verificar que no tenga puntos consecutivos
  if (cleanEmail.includes('..')) {
    return {
      isValid: false,
      message: 'El email no puede tener puntos consecutivos'
    };
  }

  // Verificar que no empiece o termine con punto
  const localPart = cleanEmail.split('@')[0];
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      message: 'El email no puede empezar o terminar con punto'
    };
  }

  // Verificar que tenga dominio válido
  const parts = cleanEmail.split('@');
  if (parts.length !== 2 || parts[1].length < 2) {
    return {
      isValid: false,
      message: 'Dominio de email inválido'
    };
  }

  // Verificar que el dominio tenga al menos un punto
  if (!parts[1].includes('.')) {
    return {
      isValid: false,
      message: 'Dominio de email inválido'
    };
  }

  return {
    isValid: true,
    message: 'Email válido'
  };
};

/**
 * Normaliza un email (convierte a minúsculas y quita espacios)
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Obtiene el dominio de un email
 */
export const getEmailDomain = (email: string): string => {
  return email.split('@')[1] || '';
};