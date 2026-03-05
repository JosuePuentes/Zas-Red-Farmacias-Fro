import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ClienteCatalogo from '../pages/cliente/ClienteCatalogo'
import ClienteCarrito from '../pages/cliente/ClienteCarrito'
import ClienteCheckout from '../pages/cliente/ClienteCheckout'
import ClienteMiCuenta from '../pages/cliente/ClienteMiCuenta'
import './Layout.css'

export default function ClienteLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <header className="layout-header">
        <h1>Zas!</h1>
        <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
          Salir
        </button>
      </header>
      <nav className="layout-nav">
        <NavLink to="/cliente" end>Catálogo</NavLink>
        <NavLink to="/cliente/carrito">Carrito</NavLink>
        <NavLink to="/cliente/mi-cuenta">Mi cuenta</NavLink>
      </nav>
      <main className="layout-main">
        <Routes>
          <Route index element={<ClienteCatalogo />} />
          <Route path="carrito" element={<ClienteCarrito />} />
          <Route path="checkout" element={<ClienteCheckout />} />
          <Route path="mi-cuenta" element={<ClienteMiCuenta />} />
        </Routes>
      </main>
    </div>
  )
}
