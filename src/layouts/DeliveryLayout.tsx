import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DeliveryPedidos from '../pages/delivery/DeliveryPedidos'
import DeliveryEstadisticas from '../pages/delivery/DeliveryEstadisticas'
import './Layout.css'

function isMasterUser(user: { role?: string; email?: string } | null): boolean {
  if (!user) return false
  const r = (user.role || '').toString().toLowerCase()
  return r === 'master' || r === 'admin' || (user.email || '').toString().toLowerCase().trim() === 'admin@zas.com'
}

export default function DeliveryLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-brand">
          <img src="/logo.png" alt="Zas!" className="layout-logo" />
          <h1>Zas! Delivery</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
          Salir
        </button>
      </header>
      <nav className="layout-nav">
        <NavLink to="/delivery" end>Pedidos</NavLink>
        <NavLink to="/delivery/estadisticas">Mis ganancias</NavLink>
        {isMasterUser(user) && <NavLink to="/elegir-portal">Cambiar portal</NavLink>}
      </nav>
      <main className="layout-main">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', width: '100%' }}>
          <aside style={{ flex: '0 0 260px' }}>
            <div className="card">
              <h3>Mi perfil de delivery</h3>
              <p><strong>{user?.nombre} {user?.apellido}</strong></p>
              {user?.cedula && <p className="muted">Cédula: {user.cedula}</p>}
              {user?.telefono && <p className="muted">Teléfono: {user.telefono}</p>}
              <p className="muted">Tipo de usuario: Delivery</p>
              <p className="muted" style={{ marginTop: '0.5rem' }}>
                Tu solicitud debe estar aprobada por el administrador para poder recibir pedidos.
              </p>
            </div>
          </aside>
          <section style={{ flex: 1, minWidth: 0 }}>
            <Routes>
              <Route index element={<DeliveryPedidos />} />
              <Route path="estadisticas" element={<DeliveryEstadisticas />} />
            </Routes>
          </section>
        </div>
      </main>
    </div>
  )
}
