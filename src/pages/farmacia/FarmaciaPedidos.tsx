import { useEffect, useRef, useState } from 'react'
import { farmaciaApi, type PedidoFarmaciaApi } from '../../api'

export default function FarmaciaPedidos() {
  const [pedidos, setPedidos] = useState<PedidoFarmaciaApi[]>([])
  const [loading, setLoading] = useState(true)
  const [procesandoId, setProcesandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const prevPedidosCountRef = useRef<number>(0)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const data = await farmaciaApi.pedidos()
      setPedidos(data)
    } catch (e) {
      console.error('Error al cargar pedidos de farmacia', e)
      setError('No se pudieron cargar los pedidos. Intenta nuevamente.')
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Sonido cuando llegan nuevos pedidos para la farmacia
  useEffect(() => {
    const prev = prevPedidosCountRef.current
    if (pedidos.length > prev && prev !== 0) {
      const audio = new Audio('/sounds/notify.mp3')
      audio.play().catch(() => {})
    }
    prevPedidosCountRef.current = pedidos.length
  }, [pedidos.length])

  async function handleValidar(id: string) {
    setProcesandoId(id)
    try {
      await farmaciaApi.validarPedido(id)
      await load()
    } catch (e) {
      console.error('Error al validar pedido', e)
      alert('No se pudo validar el pedido. Intenta nuevamente.')
    } finally {
      setProcesandoId(null)
    }
  }

  async function handleDenegar(id: string) {
    if (!window.confirm('¿Denegar este pedido?')) return
    setProcesandoId(id)
    try {
      await farmaciaApi.denegarPedido(id)
      await load()
    } catch (e) {
      console.error('Error al denegar pedido', e)
      alert('No se pudo denegar el pedido. Intenta nuevamente.')
    } finally {
      setProcesandoId(null)
    }
  }

  const pedidosNuevos = pedidos.filter((p) => p.estado === 'pendiente_validacion_farmacia')

  return (
    <div className="container">
      <h2>Pedidos</h2>
      <p className={pedidosNuevos.length > 0 ? 'badge badge-warning' : 'badge'}>
        Notificación: {pedidosNuevos.length} pedido(s) nuevo(s)
      </p>

      {error && (
        <div className="card">
          <p className="auth-error">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <p>Cargando pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card">
          <p className="muted">No hay pedidos para esta farmacia.</p>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Dirección entrega</th>
                  <th>Total ($)</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p, idx) => (
                  <tr key={p._id}>
                    <td>{idx + 1}</td>
                    <td>{p.clienteNombre}</td>
                    <td>
                      {p.clienteCedula && <span>{p.clienteCedula}</span>}
                      {p.clienteTelefono && (
                        <span className="muted" style={{ display: 'block' }}>
                          {p.clienteTelefono}
                        </span>
                      )}
                    </td>
                    <td>{p.direccionEntrega}</td>
                    <td>{p.total.toFixed(2)}</td>
                    <td>{p.estado.replace(/_/g, ' ')}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={procesandoId === p._id}
                        onClick={() => handleValidar(p._id)}
                      >
                        {procesandoId === p._id ? 'Procesando...' : 'Validar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ marginLeft: 8 }}
                        disabled={procesandoId === p._id}
                        onClick={() => handleDenegar(p._id)}
                      >
                        Denegar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h3>Detalle rápido</h3>
            <p className="muted">
              Cuando valides un pedido, el backend debe descontar existencias del inventario de esta farmacia y enviarlo al
              módulo de delivery.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
