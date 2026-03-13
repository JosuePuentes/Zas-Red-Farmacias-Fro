import { useEffect, useMemo, useState } from 'react'
import { masterApi, type DeliveryMaster, type SolicitudDeliveryMaster } from '../../api'

// Listar solicitudes de delivery pendientes y repartidores ya registrados
export default function AdminDelivery() {
  const [solicitudes, setSolicitudes] = useState<SolicitudDeliveryMaster[]>([])
  const [deliveryRegistrados, setDeliveryRegistrados] = useState<DeliveryMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [procesandoId, setProcesandoId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [sol, del] = await Promise.all([
        masterApi.solicitudesDelivery().catch(() => []),
        masterApi.delivery().catch(() => []),
      ])
      setSolicitudes(sol)
      setDeliveryRegistrados(del)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAprobar(id: string) {
    setProcesandoId(id)
    try {
      await masterApi.aprobarDelivery(id)
      await load()
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : 'Error al aprobar solicitud de delivery')
    } finally {
      setProcesandoId(null)
    }
  }

  async function handleDenegar(id: string) {
    if (!window.confirm('¿Denegar esta solicitud de delivery?')) return
    setProcesandoId(id)
    try {
      await masterApi.denegarDelivery(id)
      await load()
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : 'Error al denegar solicitud de delivery')
    } finally {
      setProcesandoId(null)
    }
  }

  const solicitudesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return solicitudes
    return solicitudes.filter((s) => {
      const nombres = (s.nombresCompletos || '').toLowerCase()
      const correo = (s.correo || '').toLowerCase()
      const direccion = (s.direccion || '').toLowerCase()
      const telefono = (s.telefono || '').toLowerCase()
      const cedula = (s.cedula || '').toLowerCase()
      return (
        nombres.includes(q) ||
        correo.includes(q) ||
        direccion.includes(q) ||
        telefono.includes(q) ||
        cedula.includes(q)
      )
    })
  }, [solicitudes, busqueda])

  const deliveryFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return deliveryRegistrados
    return deliveryRegistrados.filter((d) => {
      const nombre = (d.nombre || '').toLowerCase()
      const apellido = (d.apellido || '').toLowerCase()
      const email = (d.email || '').toLowerCase()
      const telefono = (d.telefono || '').toLowerCase()
      const cedula = (d.cedula || '').toLowerCase()
      return (
        nombre.includes(q) ||
        apellido.includes(q) ||
        email.includes(q) ||
        telefono.includes(q) ||
        cedula.includes(q)
      )
    })
  }, [deliveryRegistrados, busqueda])

  return (
    <div className="container">
      <h2>Delivery</h2>
      <p className="muted">
        Lista de solicitudes de repartidores en espera de aprobación y repartidores ya registrados en la plataforma.
      </p>

      <div className="usr-m-toolbar" style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          className="usr-m-search"
          placeholder="Buscar por nombre, correo, cédula, dirección o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <span className="usr-m-total">
          Total delivery: <strong>{deliveryRegistrados.length}</strong> &nbsp;|&nbsp; Solicitudes pendientes:{' '}
          <strong>{solicitudes.length}</strong>
        </span>
      </div>

      {loading ? (
        <p className="muted">Cargando información de delivery...</p>
      ) : (
        <>
          <section style={{ marginBottom: '1.5rem' }}>
            <h3>Solicitudes en espera de aprobación</h3>
            {solicitudesFiltradas.length === 0 ? (
              <p className="muted">No hay solicitudes de delivery para los filtros aplicados.</p>
            ) : (
              <ul className="usr-m-list">
                {solicitudesFiltradas.map((s) => (
                  <li key={s._id} className="usr-m-item card">
                    <div className="usr-m-main">
                      <span className="usr-m-nombre">
                        {s.nombresCompletos} ({s.tipoVehiculo})
                      </span>
                      <span className="usr-m-email">{s.correo}</span>
                    </div>
                    <div className="usr-m-extra">
                      <span className="usr-m-direccion">
                        Cédula: {s.cedula} — {s.direccion}
                      </span>
                      <span className="usr-m-telefono">{s.telefono}</span>
                      <span className="usr-m-role">Estado: {s.estado}</span>
                      <div className="sol-f-actions" style={{ marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-primary sol-f-btn-ok"
                          onClick={() => handleAprobar(s._id)}
                          disabled={procesandoId === s._id}
                        >
                          {procesandoId === s._id ? 'Aprobando...' : 'Aprobar'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary sol-f-btn-no"
                          onClick={() => handleDenegar(s._id)}
                          disabled={procesandoId === s._id}
                          style={{ marginLeft: 8 }}
                        >
                          Denegar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3>Repartidores registrados</h3>
            {deliveryFiltrados.length === 0 ? (
              <p className="muted">No hay repartidores registrados para los filtros aplicados.</p>
            ) : (
              <ul className="usr-m-list">
                {deliveryFiltrados.map((d) => (
                  <li key={d._id} className="usr-m-item card">
                    <div className="usr-m-main">
                      <span className="usr-m-nombre">
                        {(d.nombre || '') + (d.apellido ? ` ${d.apellido}` : '') || 'Sin nombre'}
                      </span>
                      <span className="usr-m-email">{d.email}</span>
                    </div>
                    <div className="usr-m-extra">
                      {d.cedula && <span className="usr-m-direccion">Cédula: {d.cedula}</span>}
                      {d.telefono && <span className="usr-m-telefono">{d.telefono}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
