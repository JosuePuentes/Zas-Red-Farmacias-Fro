import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const nombre = user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : user?.email?.split('@')[0] || 'Cliente'

  return (
    <div className="layout cliente-layout">
      <header className="layout-header cliente-layout-header">
        <button type="button" className="cliente-menu-btn" onClick={() => setSidebarOpen((o) => !o)} aria-label="Menú">
          ☰
        </button>
        <div className="layout-header-brand">
          <img src="/logo.png" alt="Zas!" className="layout-logo" />
          <h1>Zas!</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
          Salir
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

      <button
        type="button"
        className="cliente-cart-fab"
        onClick={() => setOpenCart(true)}
        aria-label="Ver carrito"
        title="Ver carrito"
      >
        <span className="cliente-cart-fab-icon">🛒</span>
        {totalItems > 0 && <span className="cliente-cart-fab-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
      </button>

      <CartModal />
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
