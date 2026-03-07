import { useEffect } from 'react'

export interface LineaFactura {
  descripcion: string
  precioUnidad: number
  cantidad: number
  total: number
}

export interface FacturaTicketData {
  nombreEmpresa: string
  clienteNombre: string
  clienteCedula: string
  direccionEntrega: string
  lineas: LineaFactura[]
  totalGeneral: number
  fecha?: string
}

interface FacturaTicketProps {
  data: FacturaTicketData
  onClose?: () => void
  autoPrint?: boolean
}

export default function FacturaTicket({ data, onClose, autoPrint = true }: FacturaTicketProps) {
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => {
        window.print()
      }, 300)
      return () => clearTimeout(t)
    }
  }, [autoPrint])

  return (
    <div className="factura-ticket-wrap">
      <div className="factura-ticket no-print-actions">
        {onClose && (
          <button type="button" className="btn btn-secondary factura-close no-print" onClick={onClose}>
            Cerrar
          </button>
        )}
        <button type="button" className="btn btn-primary no-print" onClick={() => window.print()}>
          Imprimir factura
        </button>
      </div>

      <div className="factura-ticket-document" id="factura-ticket-document">
        <header className="factura-header">
          <img src="/logo.png" alt="Zas" className="factura-logo" />
          <h1>{data.nombreEmpresa}</h1>
          <p className="factura-subtitle">Factura / Ticket</p>
        </header>

        <section className="factura-cliente">
          <h3>Datos del cliente</h3>
          <p><strong>Nombre:</strong> {data.clienteNombre}</p>
          <p><strong>Cédula:</strong> {data.clienteCedula}</p>
          <p><strong>Dirección de entrega:</strong> {data.direccionEntrega}</p>
        </section>

        <section className="factura-detalle">
          <h3>Detalle</h3>
          <table className="factura-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>P. unit.</th>
                <th>Cant.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.lineas.map((linea, i) => (
                <tr key={i}>
                  <td>{linea.descripcion}</td>
                  <td>$ {linea.precioUnidad.toFixed(2)}</td>
                  <td>{linea.cantidad}</td>
                  <td>$ {linea.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="factura-total">
          <p><strong>Total factura: $ {data.totalGeneral.toFixed(2)}</strong></p>
          {data.fecha && <p className="muted">{data.fecha}</p>}
        </footer>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #factura-ticket-document, #factura-ticket-document * { visibility: visible; }
          #factura-ticket-document { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print, .no-print-actions, .factura-close { display: none !important; }
        }
        .factura-ticket-wrap { padding: 1rem; max-width: 400px; margin: 0 auto; }
        .factura-ticket-document { background: #fff; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
        .factura-header { text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.75rem; }
        .factura-logo { max-height: 48px; margin-bottom: 0.5rem; }
        .factura-header h1 { margin: 0; font-size: 1.25rem; }
        .factura-subtitle { margin: 0.25rem 0 0; font-size: 0.85rem; color: #64748b; }
        .factura-cliente, .factura-detalle { margin-top: 1rem; font-size: 0.9rem; }
        .factura-cliente h3, .factura-detalle h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
        .factura-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .factura-table th, .factura-table td { border: 1px solid #e2e8f0; padding: 0.35rem 0.5rem; text-align: left; }
        .factura-table th { background: #f1f5f9; }
        .factura-total { margin-top: 1rem; padding-top: 0.75rem; border-top: 2px solid #0e7490; text-align: right; }
        .no-print-actions { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
      `}</style>
    </div>
  )
}
