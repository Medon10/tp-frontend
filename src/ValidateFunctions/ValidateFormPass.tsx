export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// Contraseñas muy comunes a evitar
const COMMON_PASSWORDS = [
  '123456',
  'password',
  '123456789',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  '123123',
  'letmein'
];

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

  // Verificar que tenga mayúscula
  const hasUpperCase = /[A-Z]/.test(password);
  if (!hasUpperCase) {
    return {
      isValid: false,
      message: 'Debe contener al menos una mayúscula'
    };
  }

  // Verificar que tenga minúscula
  const hasLowerCase = /[a-z]/.test(password);
  if (!hasLowerCase) {
    return {
      isValid: false,
      message: 'Debe contener al menos una minúscula'
    };
  }

  // Verificar que tenga número
  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    return {
      isValid: false,
      message: 'Debe contener al menos un número'
    };
  }

  // Verificar que no sea una contraseña muy común
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'Esta contraseña es demasiado común'
    };
  }

  // Verificar que no tenga caracteres repetidos consecutivamente
  const hasRepeatedChars = /(.)\1{2,}/.test(password);
  if (hasRepeatedChars) {
    return {
      isValid: false,
      message: 'Evita repetir el mismo caracter 3 veces seguidas'
    };
  }

  // Verificar secuencias simples
  const simpleSequences = ['123', '456', '789', 'abc', 'def', 'qwe'];
  const hasSimpleSequence = simpleSequences.some(seq => 
    password.toLowerCase().includes(seq)
  );
  
  if (hasSimpleSequence) {
    return {
      isValid: false,
      message: 'Evita usar secuencias simples como 123 o abc'
    };
  }

  // Recomendar longitud mayor
  if (password.length < 8) {
    return {
      isValid: true,
      message: 'Contraseña válida (se recomienda al menos 8 caracteres)'
    };
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

/**
 * Obtiene el nivel de fortaleza de una contraseña
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  
  let score = 0;
  
  // Longitud
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Tipos de caracteres
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Evitar patrones comunes
  if (!COMMON_PASSWORDS.includes(password.toLowerCase())) score += 1;
  
  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  return 'strong';
};