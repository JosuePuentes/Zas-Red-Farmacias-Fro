import { useState, useEffect } from 'react'
import { masterApi, type SolicitudPlanProMaster } from '../../api'

export default function AdminSolicitudesPlanPro() {
  const [solicitudes, setSolicitudes] = useState<SolicitudPlanProMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [procesandoId, setProcesandoId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    masterApi.solicitudesPlanPro()
      .then(setSolicitudes)
      .catch(() => setSolicitudes([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAprobar(id: string) {
    setProcesandoId(id)
    try {
      await masterApi.aprobarPlanPro(id)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al aprobar')
    } finally {
      setProcesandoId(null)
    }
  }

  function handleDenegar(id: string) {
    if (!window.confirm('¿Denegar esta solicitud de Plan Pro?')) return
    masterApi.denegarPlanPro(id).then(load).catch((e) => alert(e instanceof Error ? e.message : 'Error'))
  }

  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente')

  if (loading) {
    return <p className="sol-f-loading">Cargando solicitudes Plan Pro...</p>
  }

  return (
    <div className="solicitudes-farmacia-master">
      <h2>Solicitudes Plan Pro</h2>
      <p className="muted">Las farmacias envían pago ($ 4,99/mes) con banco, referencia y comprobante. Al aprobar, la farmacia obtiene acceso al módulo Plan Pro.</p>
      {pendientes.length === 0 ? (
        <p className="sol-f-empty">No hay solicitudes de Plan Pro pendientes.</p>
      ) : (
        <ul className="sol-f-list">
          {pendientes.map((s) => (
            <li key={s._id} className="sol-f-item card">
              <p><strong>{s.nombreFarmacia || s.farmaciaId}</strong></p>
              {s.email && <p>Correo: {s.email}</p>}
              <p>Banco emisor: {s.bancoEmisor}</p>
              <p>Número de referencia: {s.numeroReferencia}</p>
              {s.comprobanteUrl && (
                <p><a href={s.comprobanteUrl} target="_blank" rel="noopener noreferrer">Ver comprobante</a></p>
              )}
              {s.createdAt && <p className="muted">{new Date(s.createdAt).toLocaleString()}</p>}
              <div className="sol-f-actions">
                <button
                  type="button"
                  className="btn btn-primary sol-f-btn-ok"
                  onClick={() => handleAprobar(s._id)}
                  disabled={procesandoId === s._id}
                >
                  {procesandoId === s._id ? 'Aprobando...' : 'Aprobar'}
                </button>
                <button type="button" className="btn btn-secondary sol-f-btn-no" onClick={() => handleDenegar(s._id)}>
                  Denegar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
