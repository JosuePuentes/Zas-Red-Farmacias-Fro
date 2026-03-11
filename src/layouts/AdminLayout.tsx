import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { masterApi } from '../api'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminPedidos from '../pages/admin/AdminPedidos'
import AdminUsuarios from '../pages/admin/AdminUsuarios'
import AdminFarmacias from '../pages/admin/AdminFarmacias'
import AdminDelivery from '../pages/admin/AdminDelivery'
import AdminSolicitudesFarmacia from '../pages/admin/AdminSolicitudesFarmacia'
import AdminSolicitudesPlanPro from '../pages/admin/AdminSolicitudesPlanPro'
import AdminFinanzas from '../pages/admin/AdminFinanzas'
import './Layout.css'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [solFarmacia, setSolFarmacia] = useState(0)
  const [solDelivery, setSolDelivery] = useState(0)
  const [solPlanPro, setSolPlanPro] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function loadBadges() {
      try {
        const [sf, sd, sp] = await Promise.all([
          masterApi.solicitudesFarmacia().catch(() => []),
          masterApi.solicitudesDelivery().catch(() => []),
          masterApi.solicitudesPlanPro().catch(() => []),
        ])
        if (cancelled) return
        setSolFarmacia(sf.length)
        setSolDelivery(sd.filter((s) => s.estado === 'pendiente').length)
        setSolPlanPro(sp.filter((s) => s.estado === 'pendiente').length)
      } catch {
        if (cancelled) return
        setSolFarmacia(0)
        setSolDelivery(0)
        setSolPlanPro(0)
      }
    }
    loadBadges()
    const id = window.setInterval(loadBadges, 60000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

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
        <NavLink to="/admin/solicitudes-farmacia">
          Solic. farmacia {solFarmacia > 0 && <span className="badge badge-warning">{solFarmacia}</span>}
        </NavLink>
        <NavLink to="/admin/delivery">
          Delivery {solDelivery > 0 && <span className="badge badge-warning">{solDelivery}</span>}
        </NavLink>
        <NavLink to="/admin/solicitudes-plan-pro">
          Solic. Plan Pro {solPlanPro > 0 && <span className="badge badge-warning">{solPlanPro}</span>}
        </NavLink>
        <NavLink to="/admin/finanzas">Finanzas</NavLink>
        <NavLink to="/elegir-portal" className="layout-nav-portal">Cambiar portal</NavLink>
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
          <Route path="finanzas" element={<AdminFinanzas />} />
        </Routes>
      </main>
    </div>
  )
}
