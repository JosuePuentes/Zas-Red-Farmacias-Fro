import { useState } from 'react'
import MapView from '../../components/MapView'
import { VENEZUELA_CENTER } from '../../context/GeolocationContext'
import type { Coords } from '../../context/GeolocationContext'

// Tipos alineados con backend: pedido con posición delivery y ETA
interface PedidoCliente {
  _id: string
  estado: string
  total: number
  direccionEntrega?: string
  latEntrega?: number
  lngEntrega?: number
  // Posición en tiempo real del delivery (backend enviará por WebSocket o polling)
  deliveryLat?: number
  deliveryLng?: number
  etaMinutos?: number
  etaHoraLlegada?: string
  createdAt?: string
}

// Mock: reemplazar por clienteApi.misPedidos() o similar
const MOCK_PEDIDOS: PedidoCliente[] = [
  {
    _id: '1',
    estado: 'en_camino',
    total: 25.5,
    direccionEntrega: 'Av. Principal, edificio 5',
    latEntrega: 10.4806,
    lngEntrega: -66.9036,
    deliveryLat: 10.481,
    deliveryLng: -66.902,
    etaMinutos: 8,
    etaHoraLlegada: '14:35',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    estado: 'recibido',
    total: 12,
    direccionEntrega: 'Calle 10',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export default function ClientePedidos() {
  const [pedidos] = useState<PedidoCliente[]>(MOCK_PEDIDOS)
  const [seleccionado, setSeleccionado] = useState<PedidoCliente | null>(null)

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

      {pedidos.length === 0 ? (
        <div className="card">
          <p className="muted">Aún no tienes pedidos. Cuando hagas uno, aparecerá aquí y podrás seguir en tiempo real al delivery.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <p className="muted">Selecciona un pedido para ver el mapa y la hora aproximada de llegada del delivery.</p>
          </div>

          <ul className="card-list">
            {pedidos.map((p) => (
              <li key={p._id} className="card">
                <p><strong>Pedido #{p._id.slice(-6)}</strong> · {p.estado.replace('_', ' ')} · $ {p.total.toFixed(2)}</p>
                {p.direccionEntrega && <p className="muted">{p.direccionEntrega}</p>}
                {(p.estado === 'en_camino' || p.estado === 'asignado') && (
                  <>
                    {p.etaMinutos != null && <p>Llegada aprox.: {p.etaMinutos} min · ~{p.etaHoraLlegada || '—'}</p>}
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setSeleccionado(p)}>
                      Ver mapa en tiempo real
                    </button>
                  </>
                )}
                {p.estado === 'recibido' && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSeleccionado(p)}>
                    Ver ubicación de entrega
                  </button>
                )}
              </li>
            ))}
          </ul>

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
