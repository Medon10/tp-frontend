export interface ValidationResult {
  isValid: boolean;
  message: string;
}


/**
 * Validación básica de contraseña (para login)
 */
export const validatePassword = (password: string): ValidationResult => {
  // Verificar si está vacía
  if (!password) {
    return {
      isValid: false,
      message: 'La contraseña es requerida'
    };
  }

  // Verificar longitud mínima
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    };
  }

  // Verificar longitud máxima (seguridad)
  if (password.length > 128) {
    return {
      isValid: false,
      message: 'La contraseña es demasiado larga'
    };
  }

  return {
    isValid: true,
    message: 'Contraseña válida'
  };
};

/**
 * Validación completa de contraseña (para registro)
 */
export const validatePasswordStrength = (password: string): ValidationResult => {
  // Validación básica primero
  const basicValidation = validatePassword(password);
  if (!basicValidation.isValid) {
    return basicValidation;
  }


  return {
    isValid: true,
    message: 'Contraseña segura'
  };
};

/**
 * Valida que dos contraseñas coincidan
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return {
      isValid: false,
      message: 'Confirma tu contraseña'
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Las contraseñas no coinciden'
    };
  }

  return {
    isValid: true,
    message: 'Las contraseñas coinciden'
  };
};
