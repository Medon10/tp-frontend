import './PagoResultado.css';
import { useSearchParams, useNavigate } from 'react-router-dom';

const statusConfig = {
  success: {
    icon: 'fas fa-check-circle',
    title: '¡Pago exitoso!',
    message: 'Tu reserva fue confirmada. Podés ver tus viajes en la sección "Mis Viajes".',
    className: 'success',
  },
  failure: {
    icon: 'fas fa-times-circle',
    title: 'Pago rechazado',
    message: 'No se pudo procesar el pago. Podés reintentar desde "Mis Viajes".',
    className: 'failure',
  },
  pending: {
    icon: 'fas fa-clock',
    title: 'Pago pendiente',
    message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme. Mientras tanto, podés ver el estado en "Mis Viajes".',
    className: 'pending',
  },
} as const;

type StatusKey = keyof typeof statusConfig;

export function PagoResultado() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const rawStatus = params.get('status') || 'pending';
  const status: StatusKey = (rawStatus in statusConfig)
    ? rawStatus as StatusKey
    : 'pending';

  const config = statusConfig[status];

  return (
    <div className="pago-resultado-page">
      <div className="resultado-card">
        <div className={`resultado-icon ${config.className}`}>
          <i className={config.icon}></i>
        </div>

        <h1>{config.title}</h1>
        <p>{config.message}</p>

        <div className="resultado-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/mis-viajes')}
          >
            <i className="fas fa-suitcase"></i>
            Mis Viajes
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/')}
          >
            <i className="fas fa-home"></i>
            Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
