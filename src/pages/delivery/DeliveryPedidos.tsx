import { useState } from 'react'
import FacturaTicket, { type FacturaTicketData } from '../../components/FacturaTicket'

// Tipo de pedido que el backend enviará (alineado con instrucciones backend)
interface PedidoDelivery {
  _id: string
  clienteNombre: string
  clienteCedula: string
  direccionEntrega: string
  direccionFarmacia?: string
  items: { descripcion: string; precioUnidad: number; cantidad: number; total: number }[]
  total: number
  estado: string
  createdAt?: string
}

// Mock: cuando el backend esté listo, reemplazar por request a /delivery/pedidos
const MOCK_PEDIDOS: PedidoDelivery[] = [
  {
    _id: '1',
    clienteNombre: 'Juan Pérez',
    clienteCedula: 'V-12345678',
    direccionEntrega: 'Av. Principal, edificio 5, apto 3',
    direccionFarmacia: 'Farmacia San José, Calle 10',
    items: [
      { descripcion: 'Paracetamol 500mg x 10', precioUnidad: 2.5, cantidad: 2, total: 5 },
      { descripcion: 'Vitamina C 1g', precioUnidad: 4, cantidad: 1, total: 4 },
    ],
    total: 9,
    estado: 'asignado',
    createdAt: new Date().toISOString(),
  },
]

export default function DeliveryPedidos() {
  const [activo, setActivo] = useState(false)
  const [facturaPedido, setFacturaPedido] = useState<PedidoDelivery | null>(null)

  const pedidos = MOCK_PEDIDOS

  function getFacturaData(p: PedidoDelivery): FacturaTicketData {
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

  return (
    <div className="container">
      <h2>Pedidos</h2>
      {!activo ? (
        <div className="card">
          <p>Activa tu disponibilidad y mantén el GPS activo para recibir pedidos cerca de ti.</p>
          <button type="button" className="btn btn-primary" onClick={() => setActivo(true)}>
            Activar
          </button>
        </div>
      ) : (
        <>
          <p className="badge badge-success">Activo — Recibiendo pedidos (GPS requerido)</p>
          <div className="card">
            <p><strong>Recoger en:</strong> dirección de la farmacia · <strong>Entregar en:</strong> dirección del cliente</p>
          </div>

          {pedidos.length === 0 ? (
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
