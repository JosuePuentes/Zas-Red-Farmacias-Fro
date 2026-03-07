import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMasterPortal } from '../context/MasterPortalContext'
import { masterApi, type FarmaciaMaster, type UsuarioMaster } from '../api'
import './Auth.css'

function isMasterUser(user: { role?: string; email?: string } | null): boolean {
  if (!user) return false
  const role = (user.role || '').toString().toLowerCase()
  const emailNorm = (user.email || '').toString().toLowerCase().trim()
  return role === 'master' || role === 'admin' || emailNorm === 'admin@zas.com'
}

export default function ElegirPortal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setPortal } = useMasterPortal()
  const [farmacias, setFarmacias] = useState<FarmaciaMaster[]>([])
  const [clientes, setClientes] = useState<UsuarioMaster[]>([])
  const [deliveries, setDeliveries] = useState<UsuarioMaster[]>([])
  const [loadingFarmacias, setLoadingFarmacias] = useState(false)
  const [step, setStep] = useState<'elegir' | 'farmacia' | 'cliente' | 'delivery'>('elegir')
  const [farmaciaId, setFarmaciaId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [deliveryId, setDeliveryId] = useState('')

  useEffect(() => {
    if (!user || !isMasterUser(user)) {
      navigate('/', { replace: true })
      return
    }
  }, [user, navigate])

  useEffect(() => {
    if (step === 'farmacia' && farmacias.length === 0) {
      setLoadingFarmacias(true)
      masterApi.farmacias()
        .then(setFarmacias)
        .catch(() => setFarmacias([]))
        .finally(() => setLoadingFarmacias(false))
    }
  }, [step, farmacias.length])

  useEffect(() => {
    if ((step === 'cliente' && clientes.length === 0) || (step === 'delivery' && deliveries.length === 0)) {
      masterApi.usuarios()
        .then((usuarios) => {
          setClientes(usuarios.filter((u) => (u.role || '').toString().toLowerCase() === 'cliente'))
          setDeliveries(usuarios.filter((u) => (u.role || '').toString().toLowerCase() === 'delivery'))
        })
        .catch(() => {})
    }
  }, [step, clientes.length, deliveries.length])

  if (!user || !isMasterUser(user)) return null

  function handlePortal(portal: 'cliente' | 'delivery' | 'farmacia' | 'admin') {
    if (portal === 'admin') {
      setPortal('admin')
      navigate('/admin', { replace: true })
      return
    }
    if (portal === 'farmacia') {
      setStep('farmacia')
      return
    }
    if (portal === 'cliente') {
      setStep('cliente')
      return
    }
    if (portal === 'delivery') {
      setStep('delivery')
      return
    }
  }

  function handleEntrarFarmacia() {
    if (!farmaciaId) return
    setPortal('farmacia', { farmaciaId })
    navigate('/farmacia', { replace: true })
  }

  function handleEntrarCliente() {
    setPortal('cliente', clienteId ? { clienteId } : undefined)
    navigate('/cliente', { replace: true })
  }

  function handleEntrarDelivery() {
    setPortal('delivery', deliveryId ? { deliveryId } : undefined)
    navigate('/delivery', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card card container elegir-portal-card">
        <h1>¿A qué portal quieres entrar?</h1>
        <p className="auth-hint">Usas el mismo usuario y token en todos los portales. El backend reconoce que eres master y no te bloquea por suscripciones.</p>

        {step === 'elegir' && (
          <div className="elegir-portal-buttons">
            <button type="button" className="btn btn-primary btn-block" onClick={() => handlePortal('cliente')}>
              Portal Cliente
            </button>
            <button type="button" className="btn btn-primary btn-block" onClick={() => handlePortal('delivery')}>
              Portal Delivery
            </button>
            <button type="button" className="btn btn-primary btn-block" onClick={() => handlePortal('farmacia')}>
              Portal Farmacia
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => handlePortal('admin')}>
              Portal Admin (Master)
            </button>
          </div>
        )}

        {step === 'farmacia' && (
          <div className="elegir-portal-step">
            <p><strong>Elige la farmacia</strong> con la que quieres entrar. Se enviará <code>X-Farmacia-Id</code> en todas las peticiones a /api/farmacia/*.</p>
            {loadingFarmacias ? (
              <p className="muted">Cargando farmacias...</p>
            ) : farmacias.length === 0 ? (
              <p className="muted">No hay farmacias. Ve al Admin para gestionarlas.</p>
            ) : (
              <>
                <div className="form-group">
                  <label>Farmacia</label>
                  <select value={farmaciaId} onChange={(e) => setFarmaciaId(e.target.value)}>
                    <option value="">Selecciona una farmacia</option>
                    {farmacias.map((f) => (
                      <option key={f._id} value={f._id}>{f.nombreFarmacia} — {f.rif}</option>
                    ))}
                  </select>
                </div>
                <div className="elegir-portal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep('elegir')}>Volver</button>
                  <button type="button" className="btn btn-primary" onClick={handleEntrarFarmacia} disabled={!farmaciaId}>Entrar</button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'cliente' && (
          <div className="elegir-portal-step">
            <p><strong>Opcional:</strong> elige un cliente para “ver como” ese usuario. Si no eliges, verás el portal cliente con datos vacíos.</p>
            {clientes.length > 0 && (
              <div className="form-group">
                <label>Ver como cliente</label>
                <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">— Master (vista vacía) —</option>
                  {clientes.map((u) => (
                    <option key={u._id} value={u._id}>{u.email} {u.nombre ? `— ${u.nombre}` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="elegir-portal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setStep('elegir')}>Volver</button>
              <button type="button" className="btn btn-primary" onClick={handleEntrarCliente}>Entrar</button>
            </div>
          </div>
        )}

        {step === 'delivery' && (
          <div className="elegir-portal-step">
            <p><strong>Opcional:</strong> elige un delivery para “ver como” ese usuario.</p>
            {deliveries.length > 0 && (
              <div className="form-group">
                <label>Ver como delivery</label>
                <select value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)}>
                  <option value="">— Master (vista vacía) —</option>
                  {deliveries.map((u) => (
                    <option key={u._id} value={u._id}>{u.email} {u.nombre ? `— ${u.nombre}` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="elegir-portal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setStep('elegir')}>Volver</button>
              <button type="button" className="btn btn-primary" onClick={handleEntrarDelivery}>Entrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
