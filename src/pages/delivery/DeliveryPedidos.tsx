import { useEffect, useRef, useState } from 'react'
import FacturaTicket, { type FacturaTicketData } from '../../components/FacturaTicket'
import MapView from '../../components/MapView'
import { VENEZUELA_CENTER, useGeolocation } from '../../context/GeolocationContext'
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

  const { requestLocation, loading: gpsLoading, error: gpsError } = useGeolocation()
  const [ubicacionEntrega, setUbicacionEntrega] = useState<Coords | null>(null)
  const prevPedidosCountRef = useRef<number>(0)

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

  // Sonido cuando llegan nuevos pedidos (sólo si está activo)
  useEffect(() => {
    if (!activo) {
      prevPedidosCountRef.current = pedidos.length
      return
    }
    const prev = prevPedidosCountRef.current
    if (pedidos.length > prev && prev !== 0) {
      const audio = new Audio('/sounds/notify.mp3')
      audio.play().catch(() => {})
    }
    prevPedidosCountRef.current = pedidos.length
  }, [activo, pedidos.length])

  async function handleActivar() {
    try {
      const loc = await requestLocation()
      if (!loc) {
        alert('Debes activar tu ubicación (GPS) para poder recibir pedidos.')
        return
      }
      setUbicacionEntrega(loc)
      await deliveryApi.setEstado({ activo: true, lat: loc.lat, lng: loc.lng })
      setActivo(true)
    } catch {
      alert('No se pudo activar tu ubicación. Verifica los permisos de GPS.')
    }
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
        <>
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Activa tu disponibilidad y mantén el GPS activo para recibir pedidos cerca de ti.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ minWidth: '220px', minHeight: '56px', fontSize: '1.1rem' }}
              onClick={handleActivar}
              disabled={gpsLoading}
            >
              {gpsLoading ? 'Activando ubicación…' : 'Activar y compartir ubicación'}
            </button>
            {gpsError && (
              <p className="auth-error" style={{ marginTop: 12 }}>
                {gpsError}
              </p>
            )}
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h3>Tu ubicación (desactivado)</h3>
            <p className="muted">Activa tu disponibilidad para ver el mapa con tu ubicación actual.</p>
            <div style={{ pointerEvents: 'none', filter: 'grayscale(1) opacity(0.4)' }}>
              <MapView
                center={VENEZUELA_CENTER}
                deliveryPosition={ubicacionEntrega ?? VENEZUELA_CENTER}
                destinoPosition={null}
                height="40vh"
                zoom={6}
                fitBounds={false}
              />
            </div>
          </div>
        </>
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

          <div className="card" style={{ marginTop: '1rem' }}>
            <h3>Tu ubicación actual</h3>
            <p className="muted">
              Este mapa muestra tu punto de partida para los pedidos que aceptes.
            </p>
            <MapView
              center={ubicacionEntrega ?? VENEZUELA_CENTER}
              deliveryPosition={ubicacionEntrega ?? undefined}
              destinoPosition={null}
              height="40vh"
              zoom={14}
              fitBounds={false}
            />
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
