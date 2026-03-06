import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CartProvider, useCart } from '../context/CartContext'
import ClienteCatalogo from '../pages/cliente/ClienteCatalogo'
import ClienteCarrito from '../pages/cliente/ClienteCarrito'
import ClienteCheckout from '../pages/cliente/ClienteCheckout'
import ClienteMiCuenta from '../pages/cliente/ClienteMiCuenta'
import ClientePedidos from '../pages/cliente/ClientePedidos'
import ClienteSoporte from '../pages/cliente/ClienteSoporte'
import CartModal from '../components/CartModal'
import './Layout.css'
import './ClienteLayout.css'

function ClienteLayoutInner() {
  const { user, logout } = useAuth()
  const { totalItems, setOpenCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const nombre = user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : user?.email?.split('@')[0] || 'Cliente'

  const isOn = (path: string) => location.pathname === path || location.pathname === `${path}/`

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
        <button
          type="button"
          className="cliente-header-cart"
          onClick={() => setOpenCart(true)}
          aria-label="Ver carrito"
        >
          <span className="cliente-header-cart-icon">🛒</span>
          {totalItems > 0 && (
            <span className="cliente-header-cart-badge">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      </header>

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
            <NavLink to="/cliente/mi-cuenta" onClick={() => setSidebarOpen(false)}>Mi perfil</NavLink>
            <NavLink to="/cliente/mis-pedidos" onClick={() => setSidebarOpen(false)}>Mis pedidos</NavLink>
            <NavLink to="/cliente/soporte" onClick={() => setSidebarOpen(false)}>Soporte</NavLink>
            <button type="button" className="cliente-sidebar-logout" onClick={() => { setSidebarOpen(false); logout(); navigate('/'); }}>
              Salir
            </button>
          </nav>
        </aside>

        <main className="layout-main cliente-layout-main">
        <Routes>
          <Route index element={<ClienteCatalogo />} />
          <Route path="carrito" element={<ClienteCarrito />} />
          <Route path="checkout" element={<ClienteCheckout />} />
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
          <span className="cliente-bottom-icon">🏠</span>
          <span className="cliente-bottom-label">Inicio</span>
        </button>
        <button
          type="button"
          className={`cliente-bottom-item ${location.search.includes('promos=1') ? 'active' : ''}`}
          onClick={() => navigate('/cliente?promos=1')}
        >
          <span className="cliente-bottom-icon">🏷️</span>
          <span className="cliente-bottom-label">Promos</span>
        </button>
        <button
          type="button"
          className="cliente-bottom-search"
          onClick={() => navigate('/cliente?buscar=1')}
          aria-label="Buscar productos"
        >
          <span className="cliente-bottom-search-icon">🔍</span>
        </button>
        <button
          type="button"
          className={`cliente-bottom-item ${isOn('/cliente/mis-pedidos') ? 'active' : ''}`}
          onClick={() => navigate('/cliente/mis-pedidos')}
        >
          <span className="cliente-bottom-icon">📦</span>
          <span className="cliente-bottom-label">Pedidos</span>
        </button>
        <button
          type="button"
          className={`cliente-bottom-item ${isOn('/cliente/mi-cuenta') ? 'active' : ''}`}
          onClick={() => navigate('/cliente/mi-cuenta')}
        >
          <span className="cliente-bottom-icon">👤</span>
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
