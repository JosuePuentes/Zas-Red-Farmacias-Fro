import { useState, useEffect } from 'react'
import { masterApi, type SolicitudFarmacia } from '../../api'
import './AdminSolicitudesFarmacia.css'

export default function AdminSolicitudesFarmacia() {
  const [solicitudes, setSolicitudes] = useState<SolicitudFarmacia[]>([])
  const [loading, setLoading] = useState(true)
  const [procesandoId, setProcesandoId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    masterApi.solicitudesFarmacia()
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
      await masterApi.aprobarFarmacia(id)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al aprobar')
    } finally {
      setProcesandoId(null)
    }
  }

  function handleDenegar(id: string) {
    if (!window.confirm('¿Denegar esta solicitud de farmacia?')) return
    masterApi.denegarFarmacia(id).then(load).catch((e) => alert(e instanceof Error ? e.message : 'Error'))
  }

  if (loading) {
    return <p className="sol-f-loading">Cargando solicitudes de farmacia...</p>
  }

  return (
    <div className="solicitudes-farmacia-master">
      <h2>Solicitudes de farmacias</h2>
      {solicitudes.length === 0 ? (
        <p className="sol-f-empty">No hay solicitudes de farmacia pendientes.</p>
      ) : (
        <ul className="sol-f-list">
          {solicitudes.map((s) => (
            <li key={s._id} className="sol-f-item card">
              <p><strong>{s.nombreFarmacia}</strong> — RIF: {s.rif}</p>
              <p>Encargado: {s.nombreEncargado} | Tel: {s.telefono}</p>
              <p>Correo: {s.email}</p>
              <p>Dirección: {s.direccion}</p>
              {s.estadoUbicacion && <p>Estado: {s.estadoUbicacion}</p>}
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
