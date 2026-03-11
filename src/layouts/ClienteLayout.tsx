import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CartProvider, useCart } from '../context/CartContext'
import { clienteApi, type NotificacionClienteItem } from '../api'
import ClienteCatalogo from '../pages/cliente/ClienteCatalogo'
import ClienteCarrito from '../pages/cliente/ClienteCarrito'
import ClienteCheckout from '../pages/cliente/ClienteCheckout'
import ClienteMiCuenta from '../pages/cliente/ClienteMiCuenta'
import ClientePedidos from '../pages/cliente/ClientePedidos'
import ClienteRecordatorios from '../pages/cliente/ClienteRecordatorios'
import ClienteRecetas from '../pages/cliente/ClienteRecetas'
import ClienteSoporte from '../pages/cliente/ClienteSoporte'
import CartModal from '../components/CartModal'
import './Layout.css'
import './ClienteLayout.css'

function IconCart() {
  return (
    <svg className="cliente-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 4h2l2 13h11l2-9H7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="20" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconHome() {
  return (
    <svg className="cliente-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 11.5 12 4l8 7.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21.5V14h4v7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconTag() {
  return (
    <svg className="cliente-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 11.5 11.5 4H19v7.5L11.5 19 4 11.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="8" r="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg className="cliente-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="11"
        cy="11"
        r="5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m15.5 15.5 3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBox() {
  return (
    <svg className="cliente-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 8.5 12 4l8 4.5-8 4.5L4 8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 8.5v7L12 20l8-4.5v-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m12 4v9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconUser() {
  return (
    <svg className="cliente-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="9"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6 19.5c1.5-2 3.2-3 6-3s4.5 1 6 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ClienteLayoutInner() {
  const { user, logout } = useAuth()
  const isMaster = user && ((user.role || '').toString().toLowerCase() === 'master' || (user.role || '').toString().toLowerCase() === 'admin' || (user.email || '').toString().toLowerCase().trim() === 'admin@zas.com')
  const { totalItems, setOpenCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [notificaciones, setNotificaciones] = useState<NotificacionClienteItem[]>([])

  useEffect(() => {
    if (showNotif && user) {
      clienteApi.notificaciones().then(setNotificaciones).catch(() => setNotificaciones([]))
    }
  }, [showNotif, user])

  const nombre = user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : user?.email?.split('@')[0] || 'Cliente'

  const isOn = (path: string) => location.pathname === path || location.pathname === `${path}/`

  function notifTexto(n: NotificacionClienteItem): string {
    if (n.tipo === 'producto_solicitado_disponible') {
      const detalle = [n.codigo, n.descripcion].filter(Boolean).join(' — ')
      return detalle ? `El producto que solicitaste está disponible: ${detalle}` : (n.texto || 'El producto que solicitaste está disponible.')
    }
    return n.texto || 'Notificación'
  }

  return (
    <div className="layout cliente-layout">
      <header className="layout-header cliente-layout-header">
        <button type="button" className="cliente-menu-btn" onClick={() => setSidebarOpen((o) => !o)} aria-label="Menú">
          ☰
        </button>
        <div className="cliente-header-center">
          <img src="/logo.png" alt="Zas!" className="cliente-header-logo" />
          <span className="cliente-header-title">Zas!</span>
        </div>
        <div className="cliente-header-actions">
          <div className="cliente-notif-wrap" style={{ position: 'relative' }}>
            <button
              type="button"
              className="cliente-header-notif"
              onClick={() => setShowNotif((v) => !v)}
              aria-label="Notificaciones"
            >
              🔔
              {notificaciones.length > 0 && (
                <span className="badge badge-warning cliente-notif-badge">{notificaciones.length}</span>
              )}
            </button>
            {showNotif && (
              <div className="notif-dropdown cliente-notif-dropdown">
                {notificaciones.length === 0 ? (
                  <p className="notif-empty">Sin notificaciones nuevas.</p>
                ) : (
                  notificaciones.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${n.tipo === 'producto_solicitado_disponible' ? 'notif-item-producto-disponible' : ''}`}
                    >
                      {notifTexto(n)}
                      {n.fecha && <span className="muted" style={{ display: 'block', marginTop: 4 }}>{n.fecha}</span>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="cliente-header-cart"
            onClick={() => setOpenCart(true)}
            aria-label="Ver carrito"
          >
            <span className="cliente-header-cart-icon">
              <IconCart />
            </span>
            {totalItems > 0 && (
              <span className="cliente-header-cart-badge">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </header>
      {showNotif && <div className="modal-overlay" style={{ background: 'transparent' }} onClick={() => setShowNotif(false)} aria-hidden="true" />}

      <div className={`cliente-sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <div className="cliente-layout-body">
        <aside className={`cliente-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="cliente-sidebar-user">
            <div className="cliente-sidebar-avatar">{nombre.charAt(0).toUpperCase()}</div>
            <p className="cliente-sidebar-name">{nombre}</p>
            <p className="cliente-sidebar-email">{user?.email}</p>
          </div>
          <p className="cliente-sidebar-welcome">¡Hola! ¿Qué necesitas hoy?</p>
          <nav className="cliente-sidebar-nav">
            <NavLink to="/cliente" end onClick={() => setSidebarOpen(false)}>Catálogo</NavLink>
            <NavLink to="/cliente/recordatorios" onClick={() => setSidebarOpen(false)}>Recordatorios</NavLink>
            <NavLink to="/cliente/recetas" onClick={() => setSidebarOpen(false)}>Recetas</NavLink>
            <NavLink to="/cliente/mi-cuenta" onClick={() => setSidebarOpen(false)}>Mi perfil</NavLink>
            <NavLink to="/cliente/mis-pedidos" onClick={() => setSidebarOpen(false)}>Mis pedidos</NavLink>
            <NavLink to="/cliente/soporte" onClick={() => setSidebarOpen(false)}>Soporte</NavLink>
            {isMaster && <NavLink to="/elegir-portal" onClick={() => setSidebarOpen(false)}>Cambiar portal</NavLink>}
            <button type="button" className="cliente-sidebar-logout" onClick={() => { setSidebarOpen(false); logout(); navigate('/'); }}>
              Salir
            </button>
          </nav>
        </aside>

        <main className="layout-main cliente-layout-main">
        <Routes>
          <Route index element={<ClienteCatalogo showDeliveryBox={false} showSearchBar useLocationButton showInlineFilters={false} />} />
          <Route path="carrito" element={<ClienteCarrito />} />
          <Route path="checkout" element={<ClienteCheckout />} />
          <Route path="recordatorios" element={<ClienteRecordatorios />} />
          <Route path="recetas" element={<ClienteRecetas />} />
          <Route path="mi-cuenta" element={<ClienteMiCuenta />} />
          <Route path="mis-pedidos" element={<ClientePedidos />} />
          <Route path="soporte" element={<ClienteSoporte />} />
        </Routes>
        </main>
      </div>
      <CartModal />

      <nav className="cliente-bottom-nav" aria-label="Navegación principal cliente">
        <button
          type="button"
          className={`cliente-bottom-item ${isOn('/cliente') ? 'active' : ''}`}
          onClick={() => navigate('/cliente')}
        >
          <span className="cliente-bottom-icon">
            <IconHome />
          </span>
          <span className="cliente-bottom-label">Inicio</span>
        </button>
        <button
          type="button"
          className={`cliente-bottom-item ${location.search.includes('promos=1') ? 'active' : ''}`}
          onClick={() => navigate('/cliente?promos=1')}
        >
          <span className="cliente-bottom-icon">
            <IconTag />
          </span>
          <span className="cliente-bottom-label">Promos</span>
        </button>
        <button
          type="button"
          className="cliente-bottom-search"
          onClick={() => navigate('/cliente?buscar=1')}
          aria-label="Buscar productos"
        >
          <span className="cliente-bottom-search-icon">
            <IconSearch />
          </span>
        </button>
        <button
          type="button"
          className={`cliente-bottom-item ${isOn('/cliente/mis-pedidos') ? 'active' : ''}`}
          onClick={() => navigate('/cliente/mis-pedidos')}
        >
          <span className="cliente-bottom-icon">
            <IconBox />
          </span>
          <span className="cliente-bottom-label">Pedidos</span>
        </button>
        <button
          type="button"
          className={`cliente-bottom-item ${isOn('/cliente/mi-cuenta') ? 'active' : ''}`}
          onClick={() => navigate('/cliente/mi-cuenta')}
        >
          <span className="cliente-bottom-icon">
            <IconUser />
          </span>
          <span className="cliente-bottom-label">Perfil</span>
        </button>
      </nav>
    </div>
  )
}

export default function ClienteLayout() {
  return (
    <CartProvider>
      <ClienteLayoutInner />
    </CartProvider>
  )
}
