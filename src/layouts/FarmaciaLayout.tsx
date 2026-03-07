import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlanProProvider, usePlanPro } from '../context/PlanProContext'
import PlanProModal from '../components/PlanProModal'
import FarmaciaDashboard from '../pages/farmacia/FarmaciaDashboard'
import FarmaciaPedidos from '../pages/farmacia/FarmaciaPedidos'
import FarmaciaInventario from '../pages/farmacia/FarmaciaInventario'
import FarmaciaPlanPro from '../pages/farmacia/FarmaciaPlanPro'
import './Layout.css'

const NOTIF_MOCK = [
  { id: '1', tipo: 'inventario', texto: 'El sistema analizó tu inventario: tienes pocos antialérgicos. Te recomendamos comprar antialérgicos.', fecha: 'Hoy' },
  { id: '2', tipo: 'prioridad', texto: 'Has recibido pedidos masivos de antibióticos. Considera comprar: Amoxicilina 500mg, Azitromicina 500mg.', fecha: 'Hoy' },
]

function isMasterUser(user: { role?: string; email?: string } | null): boolean {
  if (!user) return false
  const r = (user.role || '').toString().toLowerCase()
  return r === 'master' || r === 'admin' || (user.email || '').toString().toLowerCase().trim() === 'admin@zas.com'
}

function FarmaciaLayoutInner() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { planProActivo, refresh } = usePlanPro()
  const [showPlanProModal, setShowPlanProModal] = useState(false)
  const [showNotif, setShowNotif] = useState(false)

  function handlePlanProClick(e: React.MouseEvent) {
    if (!planProActivo) {
      e.preventDefault()
      setShowPlanProModal(true)
    }
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-brand">
          <img src="/logo.png" alt="Zas!" className="layout-logo" />
          <h1>Zas! Farmacia</h1>
        </div>
        <div className="layout-header-actions">
          {planProActivo && (
            <div className="pro-nav-wrap" style={{ position: 'relative' }}>
              <button
                type="button"
                className="layout-nav-bell"
                onClick={() => setShowNotif((v) => !v)}
                aria-label="Notificaciones"
              >
                🔔
                {NOTIF_MOCK.length > 0 && (
                  <span className="badge badge-warning">{NOTIF_MOCK.length}</span>
                )}
              </button>
              {showNotif && (
                <div className="notif-dropdown">
                  {NOTIF_MOCK.length === 0 ? (
                    <p className="notif-empty">Sin notificaciones nuevas.</p>
                  ) : (
                    NOTIF_MOCK.map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.tipo === 'prioridad' ? 'prioridad' : 'inventario'}`}
                      >
                        {n.texto}
                        <span className="muted" style={{ display: 'block', marginTop: 4 }}>{n.fecha}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          <button type="button" className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>
            Salir
          </button>
        </div>
      </header>
      <nav className="layout-nav">
        <NavLink to="/farmacia" end>Dashboard</NavLink>
        <NavLink to="/farmacia/pedidos">Pedidos</NavLink>
        <NavLink to="/farmacia/inventario">Inventario</NavLink>
        <NavLink
          to="/farmacia/plan-pro"
          onClick={handlePlanProClick}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Plan Pro {!planProActivo && '(bloqueado)'}
        </NavLink>
        {isMasterUser(user) && <NavLink to="/elegir-portal">Cambiar portal</NavLink>}
      </nav>
      <main className="layout-main">
        <Routes>
          <Route index element={<FarmaciaDashboard />} />
          <Route path="pedidos" element={<FarmaciaPedidos />} />
          <Route path="inventario" element={<FarmaciaInventario />} />
          <Route path="plan-pro" element={planProActivo ? <FarmaciaPlanPro /> : <FarmaciaPlanProBlur onUnlock={() => setShowPlanProModal(true)} />} />
        </Routes>
      </main>

      {showPlanProModal && (
        <PlanProModal
          onClose={() => setShowPlanProModal(false)}
          onSolicitudEnviada={() => { setShowPlanProModal(false); refresh(); }}
        />
      )}

      {showNotif && <div className="modal-overlay" style={{ background: 'transparent' }} onClick={() => setShowNotif(false)} />}
    </div>
  )
}

function FarmaciaPlanProBlur({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="plan-pro-blur">
      <p>Este módulo es exclusivo del <strong>Plan Pro</strong>.</p>
      <p className="muted">Lista comparativa, carrito, órdenes de compra, proveedores, alertas de precio e inventario.</p>
      <button type="button" className="btn btn-primary" onClick={onUnlock}>
        Desbloquear Plan Pro — $ 4,99/mes
      </button>
    </div>
  )
}

export default function FarmaciaLayout() {
  return (
    <PlanProProvider>
      <FarmaciaLayoutInner />
    </PlanProProvider>
  )
}
