import { useEffect, useMemo, useState } from 'react'
import MapView from '../../components/MapView'
import { VENEZUELA_CENTER } from '../../context/GeolocationContext'
import type { Coords } from '../../context/GeolocationContext'
import { clienteApi, type PedidoClienteApi } from '../../api'
import './ClientePedidos.css'

export default function ClientePedidos() {
  const [pedidos, setPedidos] = useState<PedidoClienteApi[]>([])
  const [seleccionado, setSeleccionado] = useState<PedidoClienteApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await clienteApi.misPedidos()
        if (!cancelled) setPedidos(data)
      } catch (e) {
        console.error('Error al cargar pedidos del cliente', e)
        if (!cancelled) {
          setError('No se pudieron cargar tus pedidos. Intenta nuevamente.')
          setPedidos([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const id = window.setInterval(load, 30000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const pedidosEnCurso = useMemo(
    () => pedidos.filter((p) => !['entregado', 'cancelado', 'denegado'].includes(p.estado)),
    [pedidos],
  )
  const pedidosHistoricos = useMemo(
    () => pedidos.filter((p) => ['entregado', 'cancelado', 'denegado'].includes(p.estado)),
    [pedidos],
  )

  function getPasoEstado(estado: string): 1 | 2 | 3 | 4 {
    const e = estado.toLowerCase()
    if (e === 'entregado' || e === 'recibido') return 4
    if (e === 'en_camino') return 3
    if (e === 'asignado' || e === 'pendiente_asignacion_delivery') return 2
    return 1
  }

  const destinoCoords: Coords | null =
    seleccionado && seleccionado.latEntrega != null && seleccionado.lngEntrega != null
      ? { lat: seleccionado.latEntrega, lng: seleccionado.lngEntrega }
      : null
  const deliveryCoords: Coords | null =
    seleccionado && seleccionado.deliveryLat != null && seleccionado.deliveryLng != null
      ? { lat: seleccionado.deliveryLat, lng: seleccionado.deliveryLng }
      : null

  return (
    <div className="container">
      <h2>Mis pedidos</h2>

      {error && (
        <div className="card">
          <p className="auth-error">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <p className="muted">Cargando tus pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card">
          <p className="muted">Aún no tienes pedidos. Cuando hagas uno, aparecerá aquí y podrás seguir en tiempo real al delivery.</p>
        </div>
      ) : (
        <>
          {pedidosEnCurso.length > 0 && (
            <>
              <div className="card">
                <h3>Pedidos en curso</h3>
                <p className="muted">
                  Aquí verás el estado de verificación, recogida, ruta y entrega. Puedes abrir el mapa para seguir el pedido.
                </p>
              </div>

              <ul className="card-list">
                {pedidosEnCurso.map((p) => {
                  const paso = getPasoEstado(p.estado)
                  return (
                    <li key={p._id} className="card">
                      <p>
                        <strong>Pedido #{p._id.slice(-6)}</strong> · {p.estado.replace(/_/g, ' ')} · $ {p.total.toFixed(2)}
                      </p>
                      {p.direccionEntrega && <p className="muted">{p.direccionEntrega}</p>}
                      <div className="pedido-steps">
                        <div className={`pedido-step ${paso >= 1 ? 'activo' : ''}`}>
                          <span className="circle" />
                          <span className="label">Verificación</span>
                        </div>
                        <div className={`pedido-step ${paso >= 2 ? 'activo' : ''}`}>
                          <span className="circle" />
                          <span className="label">Recogida</span>
                        </div>
                        <div className={`pedido-step ${paso >= 3 ? 'activo' : ''}`}>
                          <span className="circle" />
                          <span className="label">En camino</span>
                        </div>
                        <div className={`pedido-step ${paso >= 4 ? 'activo' : ''}`}>
                          <span className="circle" />
                          <span className="label">Entregado</span>
                        </div>
                      </div>
                      {(p.estado === 'en_camino' || p.estado === 'asignado' || p.estado === 'pendiente_asignacion_delivery') && (
                        <>
                          {p.etaMinutos != null && (
                            <p>
                              Llegada aprox.: {p.etaMinutos} min · ~{p.etaHoraLlegada || '—'}
                            </p>
                          )}
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => setSeleccionado(p)}>
                            Ver seguimiento en mapa
                          </button>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {pedidosHistoricos.length > 0 && (
            <>
              <div className="card" style={{ marginTop: '1rem' }}>
                <h3>Pedidos anteriores</h3>
              </div>
              <ul className="card-list">
                {pedidosHistoricos.map((p) => (
                  <li key={p._id} className="card">
                    <p>
                      <strong>Pedido #{p._id.slice(-6)}</strong> · {p.estado.replace(/_/g, ' ')} · $ {p.total.toFixed(2)}
                    </p>
                    {p.direccionEntrega && <p className="muted">{p.direccionEntrega}</p>}
                  </li>
                ))}
              </ul>
            </>
          )}

          {seleccionado && (
            <div className="card pedido-mapa-card">
              <h3>Seguimiento del pedido</h3>
              {destinoCoords && (
                <p className="muted">Tu ubicación de entrega · {seleccionado.etaMinutos != null && `Llegada aprox.: ${seleccionado.etaMinutos} min (~${seleccionado.etaHoraLlegada || '—'})`}</p>
              )}
              <MapView
                center={VENEZUELA_CENTER}
                deliveryPosition={deliveryCoords}
                destinoPosition={destinoCoords}
                height="50vh"
                zoom={14}
                fitBounds={!!(deliveryCoords && destinoCoords)}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSeleccionado(null)}>
                Cerrar mapa
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
