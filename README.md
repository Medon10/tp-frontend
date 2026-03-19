# VacationMatch — Frontend

Interfaz de usuario de la plataforma VacationMatch, desarrollada con **React 19**, **TypeScript**, **Vite 7** y **React Router 7**.

## Inicio Rápido

```bash
npm install        # Instalar dependencias
npm run dev        # Iniciar en modo desarrollo (puerto 5173)
npm run build      # Compilar para producción
npm run preview    # Previsualizar build de producción
npm run lint       # Ejecutar ESLint
```

> **Importante:** El backend debe estar corriendo antes de iniciar el frontend.

## Configuración

Crear un archivo `.env` en la raíz (opcional):

```env
VITE_API_URL=http://localhost:3000/api
```

Si no se crea, el frontend usa `http://localhost:3000/api` por defecto. En producción, configurar con la URL pública del backend.

## Estructura

```
src/
├── App.tsx               # Router principal y layout
├── pages/                # Páginas de la aplicación
│   ├── Home/             # Búsqueda de vuelos por presupuesto
│   ├── Login/            # Inicio de sesión
│   ├── Register/         # Registro de usuario
│   ├── Destinos/         # Listado de destinos turísticos
│   ├── DetalleDestino/   # Detalle de destino con vuelos disponibles
│   ├── Favoritos/        # Vuelos guardados como favoritos
│   ├── Historial/        # Mis viajes (reservas por estado)
│   ├── Perfil/           # Perfil del usuario con estadísticas
│   ├── Admin/            # Panel admin (CRUD vuelos)
│   └── Unauthorized/     # Página de acceso denegado
├── components/layout/    # Componentes reutilizables (Header, Footer, Modales)
├── context/              # Estado global (AuthContext, FavoriteContext)
├── routes/               # Guards de rutas (ProtectedRoute, AdminRoute)
├── services/             # Instancia Axios centralizada
└── ValidateFunctions/    # Validaciones de formularios
```

## Tecnologías

| Tecnología | Uso |
|-----------|-----|
| React 19 | Framework de UI |
| TypeScript | Tipado estático |
| Vite 7 | Build tool y dev server |
| React Router 7 | Navegación SPA |
| Axios | Comunicación con la API |
| CSS Custom Properties | Estilos y temas |
| Font Awesome (CDN) | Iconografía |

## Funcionalidades

- **Búsqueda inteligente** de vuelos por presupuesto, personas y origen
- **Autenticación** con JWT (Bearer token en LocalStorage)
- **Dos niveles de acceso:** usuario y administrador
- **Rutas protegidas** con guards (`ProtectedRoute`, `AdminRoute`)
- **Favoritos** con estado global vía Context API
- **Reservas** con integración de pagos (Mercado Pago)
- **Panel de administración** para gestión de vuelos
- **Responsive design** con breakpoints SM, MD, LG

## Deploy

El frontend se puede deployar en cualquier servicio de hosting estático:
- [Netlify](https://netlify.com) · [Cloudflare Pages](https://pages.cloudflare.com) · [Vercel](https://vercel.com)

Al deployar, asegurate de configurar la variable de entorno `VITE_API_URL` con la URL pública del backend.

## Documentación del Proyecto

- [README principal del proyecto](https://github.com/Medon10/tp-backend#readme) — Instalación completa, stack, estructura
- [Documentación de la API](https://github.com/Medon10/tp-backend/blob/main/docs/api.md) — Todos los endpoints
- [Propuesta del TP](https://github.com/Medon10/tp-backend/blob/main/docs/proposal.md) — Alcance y definición

## Evidencia de Tests

Estado actual de evidencia automatizada:

- Unit tests frontend: `tests/unit/Notification.test.tsx`
- End-to-end tests frontend: `e2e/login.spec.ts`

Comandos para generar evidencia:

```bash
npm test -- --run
npm run test:e2e
```

> Sugerencia para defensa: guardar capturas o reporte de Playwright en `playwright-report/` y linkear evidencia puntual desde esta seccion.

## Credenciales de Prueba

Completar con credenciales reales del deploy:

| Rol | Email | Contraseña | Estado |
|-----|-------|------------|--------|
| Admin | COMPLETAR | COMPLETAR | Pendiente |
| Cliente | COMPLETAR | COMPLETAR | Pendiente |

En entorno local:

- Cliente: registrarse desde la pantalla de registro.
- Admin: promover un usuario existente cambiando `rol = 'admin'` en la base de datos del backend.

## Video Demo

Link del video de funcionamiento (pendiente de carga):

- COMPLETAR (YouTube no listado o Google Drive)

## Gestión del Proyecto

Seccion reservada para evidencia de gestion (a completar por el equipo):

- Metodologia utilizada: COMPLETAR (Scrum, Kanban, XP, hibrida)
- Minutas de reuniones: COMPLETAR (link a markdown/pdf/doc compartido)
- Tracking de tareas: COMPLETAR (GitHub Projects, Trello, Jira, etc.)
