import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminPedidos from '../pages/admin/AdminPedidos'
import AdminUsuarios from '../pages/admin/AdminUsuarios'
import AdminFarmacias from '../pages/admin/AdminFarmacias'
import AdminDelivery from '../pages/admin/AdminDelivery'
import AdminSolicitudesFarmacia from '../pages/admin/AdminSolicitudesFarmacia'
import AdminSolicitudesPlanPro from '../pages/admin/AdminSolicitudesPlanPro'
import './Layout.css'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-brand">
          <img src="/logo.png" alt="Zas!" className="layout-logo" />
          <h1>Zas! Admin</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
          Salir
        </button>
      </header>
      <nav className="layout-nav">
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/pedidos">Pedidos</NavLink>
        <NavLink to="/admin/usuarios">Clientes</NavLink>
        <NavLink to="/admin/farmacias">Farmacias</NavLink>
        <NavLink to="/admin/solicitudes-farmacia">Solic. farmacia</NavLink>
        <NavLink to="/admin/delivery">Delivery</NavLink>
        <NavLink to="/admin/solicitudes-plan-pro">Solic. Plan Pro</NavLink>
      </nav>
      <main className="layout-main">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="farmacias" element={<AdminFarmacias />} />
          <Route path="solicitudes-farmacia" element={<AdminSolicitudesFarmacia />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="solicitudes-plan-pro" element={<AdminSolicitudesPlanPro />} />
        </Routes>
      </main>
    </div>
  )
}
