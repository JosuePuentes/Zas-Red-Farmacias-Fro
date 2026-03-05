import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminPedidos from '../pages/admin/AdminPedidos'
import AdminFarmacias from '../pages/admin/AdminFarmacias'
import AdminDelivery from '../pages/admin/AdminDelivery'
import './Layout.css'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <header className="layout-header">
        <h1>Zas! Admin</h1>
        <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
          Salir
        </button>
      </header>
      <nav className="layout-nav">
        <NavLink to="/admin" end>Pedidos</NavLink>
        <NavLink to="/admin/farmacias">Farmacias</NavLink>
        <NavLink to="/admin/delivery">Repartidores</NavLink>
      </nav>
      <main className="layout-main">
        <Routes>
          <Route index element={<AdminPedidos />} />
          <Route path="farmacias" element={<AdminFarmacias />} />
          <Route path="delivery" element={<AdminDelivery />} />
        </Routes>
      </main>
    </div>
  )
}
