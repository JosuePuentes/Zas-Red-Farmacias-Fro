import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FarmaciaDashboard from '../pages/farmacia/FarmaciaDashboard'
import FarmaciaPedidos from '../pages/farmacia/FarmaciaPedidos'
import FarmaciaInventario from '../pages/farmacia/FarmaciaInventario'
import './Layout.css'

export default function FarmaciaLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-brand">
          <img src="/logo.png" alt="Zas!" className="layout-logo" />
          <h1>Zas! Farmacia</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
          Salir
        </button>
      </header>
      <nav className="layout-nav">
        <NavLink to="/farmacia" end>Dashboard</NavLink>
        <NavLink to="/farmacia/pedidos">Pedidos</NavLink>
        <NavLink to="/farmacia/inventario">Inventario</NavLink>
      </nav>
      <main className="layout-main">
        <Routes>
          <Route index element={<FarmaciaDashboard />} />
          <Route path="pedidos" element={<FarmaciaPedidos />} />
          <Route path="inventario" element={<FarmaciaInventario />} />
        </Routes>
      </main>
    </div>
  )
}
