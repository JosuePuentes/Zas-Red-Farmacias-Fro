import { useEffect, useState } from 'react'
import FacturaTicket, { type FacturaTicketData } from '../../components/FacturaTicket'
import MapView from '../../components/MapView'
import { VENEZUELA_CENTER } from '../../context/GeolocationContext'
import type { Coords } from '../../context/GeolocationContext'
import { deliveryApi, type PedidoDeliveryApi } from '../../api'

export default function DeliveryPedidos() {
  const [activo, setActivo] = useState(false)
  const [pedidos, setPedidos] = useState<PedidoDeliveryApi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facturaPedido, setFacturaPedido] = useState<PedidoDeliveryApi | null>(null)
  const [seleccionado, setSeleccionado] = useState<PedidoDeliveryApi | null>(null)
  const [aceptandoId, setAceptandoId] = useState<string | null>(null)

  const destinoCoords: Coords | null =
    seleccionado?.coordsEntrega ? seleccionado.coordsEntrega : null
  const farmaciaCoords: Coords | null =
    seleccionado?.coordsFarmacia ? seleccionado.coordsFarmacia : null

  function getFacturaData(p: PedidoDeliveryApi): FacturaTicketData {
    return {
      nombreEmpresa: 'Zas',
      clienteNombre: p.clienteNombre,
      clienteCedula: p.clienteCedula,
      direccionEntrega: p.direccionEntrega,
      lineas: p.items.map((i) => ({
        descripcion: i.descripcion,
        precioUnidad: i.precioUnidad,
        cantidad: i.cantidad,
        total: i.total,
      })),
      totalGeneral: p.total,
      fecha: p.createdAt ? new Date(p.createdAt).toLocaleString() : undefined,
    }
  }

  async function cargarPedidos() {
    try {
      setLoading(true)
      setError(null)
      const data = await deliveryApi.pedidos()
      setPedidos(data)
    } catch (e) {
      console.error('Error al cargar pedidos de delivery', e)
      setError('No se pudieron cargar los pedidos. Intenta nuevamente.')
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activo) {
      cargarPedidos()
    }
  }, [activo])

  async function handleActivar() {
    try {
      await deliveryApi.setEstado({ activo: true })
    } catch {
      // si falla, igual activamos solo a nivel de frontend
    }
    setActivo(true)
  }

  async function handleDesactivar() {
    try {
      await deliveryApi.setEstado({ activo: false })
    } catch {
      // ignorar error visual por ahora
    }
    setActivo(false)
    setPedidos([])
    setSeleccionado(null)
  }

  async function handleAceptarPedido(id: string) {
    setAceptandoId(id)
    try {
      const res = await deliveryApi.aceptarPedido(id)
      if (!res.ok) {
        alert(res.message || 'El pedido ya fue tomado por otro delivery.')
      }
      await cargarPedidos()
    } catch (e) {
      console.error('Error al aceptar pedido', e)
      alert('No se pudo aceptar el pedido. Intenta nuevamente.')
    } finally {
      setAceptandoId(null)
    }
  }

  return (
    <div className="container">
      <h2>Pedidos</h2>
      {!activo ? (
        <div className="card">
          <p>Activa tu disponibilidad y mantén el GPS activo para recibir pedidos cerca de ti.</p>
          <button type="button" className="btn btn-primary" onClick={handleActivar}>
            Activar
          </button>
        </div>
      ) : (
        <>
          <p className="badge badge-success">
            Activo — Recibiendo pedidos (GPS requerido)
          </p>
          <div className="card">
            <p>
              <strong>Recoger en:</strong> dirección de la farmacia ·{' '}
              <strong>Entregar en:</strong> dirección del cliente
            </p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleDesactivar}>
              Desactivar
            </button>
          </div>

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
              <p className="muted">No hay pedidos asignados. Cuando aceptes uno, aparecerá aquí con la dirección de recogida y entrega.</p>
            </div>
          ) : (
            <ul className="card-list">
              {pedidos.map((pedido) => (
                <li key={pedido._id} className="card">
                  <p><strong>{pedido.clienteNombre}</strong> · {pedido.direccionEntrega}</p>
                  {pedido.direccionFarmacia && <p className="muted">Recoger: {pedido.direccionFarmacia}</p>}
                  <p>Total: $ {pedido.total.toFixed(2)} · Estado: {pedido.estado}</p>
                  {pedido.estado === 'pendiente_asignacion_delivery' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={aceptandoId === pedido._id}
                      onClick={() => handleAceptarPedido(pedido._id)}
                    >
                      {aceptandoId === pedido._id ? 'Tomando pedido...' : 'Aceptar pedido'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: 8 }}
                    onClick={() => setSeleccionado(pedido)}
                  >
                    Ver mapa
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFacturaPedido(pedido)}
                  >
                    Imprimir factura
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {seleccionado && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>Mapa de recogida y entrega</h3>
          <MapView
            center={VENEZUELA_CENTER}
            deliveryPosition={farmaciaCoords}
            destinoPosition={destinoCoords}
            height="50vh"
            zoom={14}
            fitBounds={!!(farmaciaCoords && destinoCoords)}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSeleccionado(null)}>
            Cerrar mapa
          </button>
        </div>
      )}

      {facturaPedido && (
        <div className="modal-overlay" onClick={() => setFacturaPedido(null)}>
          <div className="modal-content factura-modal" onClick={(e) => e.stopPropagation()}>
            <FacturaTicket
              data={getFacturaData(facturaPedido)}
              onClose={() => setFacturaPedido(null)}
              autoPrint={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}
