import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
    baseURL,
    withCredentials: true, // enviar/recibir cookies para auth
})

// ── Interceptor de respuestas ────────────────────────────────────
// Centraliza el manejo de errores HTTP comunes para toda la app.
// Evita duplicar lógica de redirección en cada página/componente.
api.interceptors.response.use(
  (response) => response, // las respuestas exitosas pasan sin cambios
  (error) => {
    // Si no hay respuesta del servidor (red caída, timeout, CORS, etc.)
    if (!error.response) {
      return Promise.reject(error)
    }

    const { status } = error.response

    if (status === 401) {
      // Token expirado o inválido → limpiar storage y redirigir a login
      // No importamos AuthContext para evitar dependencia circular;
      // el AuthContext detectará la pérdida de token al re-montar.
      localStorage.removeItem('auth_token')
      const currentPath = window.location.pathname
      // Evitar loop infinito si ya estamos en /login
      if (currentPath !== '/login') {
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      // Usuario autenticado pero sin permisos
      window.location.href = '/unauthorized'
    }

    // Todos los errores se siguen rechazando para que los componentes
    // puedan manejar casos específicos (ej: 409 email duplicado en signup)
    return Promise.reject(error)
  }
)
