import { useAuth } from '../../context/AuthContext'
// Datos del cliente a la izquierda; recordar activar GPS para delivery
export default function ClienteMiCuenta() {
  const { user } = useAuth()
  return (
    <div className="container">
      <h2>Mi cuenta</h2>
      <div className="card" style={{ maxWidth: 320 }}>
        <p><strong>Cédula:</strong> {user?.cedula || '—'}</p>
        <p><strong>Nombre:</strong> {user?.nombre} {user?.apellido}</p>
        <p><strong>Dirección:</strong> {user?.direccion || '—'}</p>
        <p><strong>Correo:</strong> {user?.email}</p>
      </div>
      <p className="badge badge-info">Activa el GPS al usar la app para que el repartidor pueda ver tu ubicación.</p>
    </div>
  )
}
