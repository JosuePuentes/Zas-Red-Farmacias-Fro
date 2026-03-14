import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-brand delivery-header-brand">
          <button
            type="button"
            className="delivery-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            ☰
          </button>
          <img src="/logo.png" alt="Zas!" className="layout-logo" />
          <h1>Zas! Delivery</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
          Salir
        </button>
      </header>
      <nav className="layout-nav delivery-nav-desktop">
        <NavLink to="/delivery" end>Pedidos</NavLink>
        <NavLink to="/delivery/estadisticas">Mis ganancias</NavLink>
        {isMasterUser(user) && <NavLink to="/elegir-portal">Cambiar portal</NavLink>}
      </nav>
      <main className="layout-main">
        <div className="delivery-shell" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', width: '100%' }}>
          <aside className="delivery-sidebar-desktop" style={{ flex: '0 0 260px' }}>
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
      {menuOpen && (
        <>
          <div className="delivery-menu-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="delivery-sidebar-mobile card">
            <h3>Mi perfil de delivery</h3>
            <p><strong>{user?.nombre} {user?.apellido}</strong></p>
            {user?.cedula && <p className="muted">Cédula: {user.cedula}</p>}
            {user?.telefono && <p className="muted">Teléfono: {user.telefono}</p>}
            <p className="muted">Tipo de usuario: Delivery</p>
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              Tu solicitud debe estar aprobada por el administrador para poder recibir pedidos.
            </p>
            <hr />
            <p className="delivery-nav-mobile-title">Menú</p>
            <nav className="delivery-nav-mobile" aria-label="Módulos">
              <NavLink to="/delivery" end className="delivery-nav-mobile-link" onClick={() => setMenuOpen(false)}>
                Pedidos
              </NavLink>
              <NavLink to="/delivery/estadisticas" className="delivery-nav-mobile-link" onClick={() => setMenuOpen(false)}>
                Mis ganancias
              </NavLink>
              {isMasterUser(user) && (
                <NavLink to="/elegir-portal" className="delivery-nav-mobile-link" onClick={() => setMenuOpen(false)}>
                  Cambiar portal
                </NavLink>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
