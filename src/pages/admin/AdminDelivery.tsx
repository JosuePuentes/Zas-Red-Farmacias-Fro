import { useEffect, useMemo, useState } from 'react'
import { masterApi, type DeliveryMaster, type SolicitudDeliveryMaster, getBackendBaseUrl } from '../../api'

// Listar solicitudes de delivery pendientes y repartidores ya registrados
export default function AdminDelivery() {
  const [solicitudes, setSolicitudes] = useState<SolicitudDeliveryMaster[]>([])
  const [deliveryRegistrados, setDeliveryRegistrados] = useState<DeliveryMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [procesandoId, setProcesandoId] = useState<string | null>(null)
  const [detalle, setDetalle] = useState<SolicitudDeliveryMaster | null>(null)

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

  const backendBase = getBackendBaseUrl()

  function buildSolicitudImageUrl(path?: string): string | null {
    if (!path) return null
    const raw = String(path).replace(/\\/g, '/').trim()
    if (!raw) return null
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    if (!backendBase) return null
    return `${backendBase}/${raw.replace(/^\/+/, '')}`
  }

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
                        className="btn btn-secondary"
                        onClick={() => setDetalle(s)}
                        style={{ marginRight: 8 }}
                      >
                        Ver detalles
                      </button>
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

      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>Detalle de solicitud delivery</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetalle(null)}>
                Cerrar
              </button>
            </div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <p><strong>{detalle.nombresCompletos}</strong> ({detalle.tipoVehiculo})</p>
              <p>Cédula: {detalle.cedula}</p>
              {detalle.matriculaVehiculo && <p>Matrícula vehículo: {detalle.matriculaVehiculo}</p>}
              <p>Teléfono: {detalle.telefono}</p>
              <p>Correo: {detalle.correo}</p>
              <p>Dirección: {detalle.direccion}</p>
              <p>Número de licencia: {detalle.numeroLicencia}</p>
              <p>Estado de la solicitud: {detalle.estado}</p>
            </div>
            <div className="card">
              <h4 style={{ marginTop: 0 }}>Documentos cargados</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem' }}>
                <DocumentoImagen label="Licencia" url={buildSolicitudImageUrl(detalle.fotoLicenciaUrl) ?? undefined} />
                <DocumentoImagen label="Carnet de circulación" url={buildSolicitudImageUrl(detalle.carnetCirculacionUrl) ?? undefined} />
                <DocumentoImagen label="Foto tipo carnet" url={buildSolicitudImageUrl(detalle.fotoCarnetUrl) ?? undefined} />
                <DocumentoImagen label="Foto del vehículo" url={buildSolicitudImageUrl(detalle.fotoVehiculoUrl) ?? undefined} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface DocumentoImagenProps {
  label: string
  url?: string
}

function DocumentoImagen({ label, url }: DocumentoImagenProps) {
  const [loadError, setLoadError] = useState(false)
  if (!url) {
    return (
      <div>
        <p style={{ marginBottom: 4, fontWeight: 500 }}>{label}</p>
        <p className="muted" style={{ fontSize: '0.85rem' }}>No enviado</p>
      </div>
    )
  }
  return (
    <div>
      <p style={{ marginBottom: 4, fontWeight: 500 }}>{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer">
        {loadError ? (
          <div
            style={{
              width: '100%',
              minHeight: 120,
              background: '#f1f5f9',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: 12,
              fontSize: '0.8rem',
              color: '#64748b',
            }}
          >
            <span>No se pudo cargar la imagen</span>
            <span style={{ fontSize: '0.75rem' }}>Abrir enlace para ver</span>
          </div>
        ) : (
          <img
            src={url}
            alt={label}
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            onError={() => setLoadError(true)}
          />
        )}
      </a>
    </div>
  )
}
