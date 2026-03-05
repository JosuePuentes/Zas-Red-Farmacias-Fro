import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DeliveryPedidos from '../pages/delivery/DeliveryPedidos'
import DeliveryEstadisticas from '../pages/delivery/DeliveryEstadisticas'
import './Layout.css'

export default function DeliveryLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <header className="layout-header">
        <h1>Zas! Delivery</h1>
        <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
          Salir
        </button>
      </header>
      <nav className="layout-nav">
        <NavLink to="/delivery" end>Pedidos</NavLink>
        <NavLink to="/delivery/estadisticas">Mis ganancias</NavLink>
      </nav>
      <main className="layout-main">
        <Routes>
          <Route index element={<DeliveryPedidos />} />
          <Route path="estadisticas" element={<DeliveryEstadisticas />} />
        </Routes>
      </main>
    </div>
  )
}
