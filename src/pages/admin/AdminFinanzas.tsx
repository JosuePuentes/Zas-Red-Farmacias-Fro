import { useEffect, useState } from 'react'
import { masterApi } from '../../api'

interface FinanzasResumen {
  totalVentas: number
  totalComisionVentas3Pct: number
  totalDeliveryBruto: number
  totalComisionDelivery20Pct: number
  gananciaTotalApp: number
  porFarmacia: {
    farmaciaId: string
    nombreFarmacia: string
    totalVentas: number
    comision3Pct: number
  }[]
  porDelivery: {
    deliveryId: string
    nombre: string
    totalDeliveryBruto: number
    pagarDelivery: number
    comisionApp20Pct: number
  }[]
}

export default function AdminFinanzas() {
  const [data, setData] = useState<FinanzasResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await masterApi.finanzasResumen()
        if (!cancelled) setData(res)
      } catch (e) {
        console.error('Error al cargar resumen de finanzas', e)
        if (!cancelled) {
          setError('No se pudo cargar el resumen de finanzas.')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="container">
        <h2>Finanzas</h2>
        <div className="card">
          <p className="muted">Cargando resumen de finanzas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h2>Finanzas</h2>
        <div className="card">
          <p className="auth-error">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container">
        <h2>Finanzas</h2>
        <div className="card">
          <p className="muted">No hay datos de finanzas disponibles.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Finanzas</h2>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Total ventas</h3>
          <p className="big-number">$ {data.totalVentas.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Comisión ventas (3%)</h3>
          <p className="big-number">$ {data.totalComisionVentas3Pct.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Delivery bruto</h3>
          <p className="big-number">$ {data.totalDeliveryBruto.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Comisión delivery (20%)</h3>
          <p className="big-number">$ {data.totalComisionDelivery20Pct.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Ganancia total app</h3>
          <p className="big-number">$ {data.gananciaTotalApp.toFixed(2)}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Comisión por farmacia (3% ventas)</h3>
        {data.porFarmacia.length === 0 ? (
          <p className="muted">No hay ventas registradas por farmacia.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Farmacia</th>
                  <th>Total ventas ($)</th>
                  <th>Comisión 3% ($)</th>
                </tr>
              </thead>
              <tbody>
                {data.porFarmacia.map((f) => (
                  <tr key={f.farmaciaId}>
                    <td>{f.nombreFarmacia}</td>
                    <td>{f.totalVentas.toFixed(2)}</td>
                    <td>{f.comision3Pct.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Delivery: pagos y comisión app (20%)</h3>
        {data.porDelivery.length === 0 ? (
          <p className="muted">No hay pedidos de delivery registrados.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Delivery</th>
                  <th>Delivery bruto ($)</th>
                  <th>Pagar delivery (80%) ($)</th>
                  <th>Comisión app (20%) ($)</th>
                </tr>
              </thead>
              <tbody>
                {data.porDelivery.map((d) => (
                  <tr key={d.deliveryId}>
                    <td>{d.nombre}</td>
                    <td>{d.totalDeliveryBruto.toFixed(2)}</td>
                    <td>{d.pagarDelivery.toFixed(2)}</td>
                    <td>{d.comisionApp20Pct.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

