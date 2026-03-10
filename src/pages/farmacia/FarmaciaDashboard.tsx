import { useEffect, useState } from 'react'
import { farmaciaApi, type DashboardFarmaciaStats } from '../../api'
import './FarmaciaDashboard.css'

export default function FarmaciaDashboard() {
  const [stats, setStats] = useState<DashboardFarmaciaStats>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    farmaciaApi
      .dashboard()
      .then((data) => { if (!cancelled) setStats(data || {}) })
      .catch(() => { if (!cancelled) setStats({}) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const totalUsuarios = typeof stats.totalUsuariosApp === 'number' ? stats.totalUsuariosApp : null
  const totalClientes = typeof stats.totalClientesFarmacia === 'number' ? stats.totalClientesFarmacia : null
  const ventasMes = typeof stats.ventasMesActual === 'number' ? stats.ventasMesActual : null
  const ventasAnterior = typeof stats.ventasMesAnterior === 'number' ? stats.ventasMesAnterior : null
  const totalPedidos = typeof stats.totalPedidosMes === 'number' ? stats.totalPedidosMes : null
  const inventarioVar = typeof stats.inventarioVariacionPct === 'number' ? stats.inventarioVariacionPct : null
  const usuariosCrecimiento = typeof stats.usuariosCrecimientoPct === 'number' ? stats.usuariosCrecimientoPct : null
  const clientesCrecimiento = typeof stats.clientesCrecimientoPct === 'number' ? stats.clientesCrecimientoPct : null

  return (
    <div className="container farmacia-dashboard">
      <h2>Dashboard</h2>
      <p className="muted">Indicadores y tendencias. Visible para todas las farmacias.</p>

      {loading && <p className="muted">Cargando indicadores...</p>}

      {!loading && (
        <>
          <div className="farmacia-dashboard-cards">
            <div className="card farmacia-dashboard-card">
              <h3>Total usuarios de la app</h3>
              <p className="farmacia-dashboard-number">
                {totalUsuarios != null ? totalUsuarios.toLocaleString() : '—'}
              </p>
              <p className="farmacia-dashboard-hint">Número total de usuarios (sin datos personales)</p>
              {usuariosCrecimiento != null && (
                <p className={`farmacia-dashboard-trend ${usuariosCrecimiento >= 0 ? 'up' : 'down'}`}>
                  {usuariosCrecimiento >= 0 ? '↑' : '↓'} {Math.abs(usuariosCrecimiento).toFixed(1)}% vs período anterior
                </p>
              )}
            </div>

            <div className="card farmacia-dashboard-card">
              <h3>Tus clientes</h3>
              <p className="farmacia-dashboard-number">
                {totalClientes != null ? totalClientes.toLocaleString() : '—'}
              </p>
              {clientesCrecimiento != null && (
                <p className={`farmacia-dashboard-trend ${clientesCrecimiento >= 0 ? 'up' : 'down'}`}>
                  {clientesCrecimiento >= 0 ? '↑' : '↓'} {Math.abs(clientesCrecimiento).toFixed(1)}% crecimiento
                </p>
              )}
            </div>

            <div className="card farmacia-dashboard-card">
              <h3>Ventas del mes</h3>
              <p className="farmacia-dashboard-number">
                {ventasMes != null ? `$ ${ventasMes.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '—'}
              </p>
              {totalPedidos != null && (
                <p className="farmacia-dashboard-hint">{totalPedidos} pedidos este mes</p>
              )}
              {ventasAnterior != null && ventasMes != null && (
                <p className={`farmacia-dashboard-trend ${ventasMes >= ventasAnterior ? 'up' : 'down'}`}>
                  {ventasMes >= ventasAnterior ? '↑' : '↓'} vs mes anterior
                </p>
              )}
            </div>

            <div className="card farmacia-dashboard-card">
              <h3>Inventario</h3>
              <p className="farmacia-dashboard-number">
                {inventarioVar != null ? `${inventarioVar >= 0 ? '+' : ''}${inventarioVar.toFixed(1)}%` : '—'}
              </p>
              <p className="farmacia-dashboard-hint">
                {inventarioVar != null
                  ? inventarioVar >= 0
                    ? 'Crecimiento vs período anterior'
                    : 'Decadencia vs período anterior'
                  : 'Variación de stock'}
              </p>
            </div>
          </div>

          <div className="farmacia-dashboard-charts">
            <div className="card farmacia-dashboard-chart-card">
              <h3>Indicadores de ventas</h3>
              <div className="farmacia-dashboard-bar-wrap">
                <div className="farmacia-dashboard-bar-label">
                  <span>Mes actual</span>
                  <span>{ventasMes != null ? `$ ${ventasMes.toLocaleString()}` : '—'}</span>
                </div>
                <div className="farmacia-dashboard-bar-track">
                  <div
                    className="farmacia-dashboard-bar-fill"
                    style={{
                      width: ventasMes != null && ventasAnterior != null && ventasAnterior > 0
                        ? `${Math.min(100, (ventasMes / ventasAnterior) * 100)}%`
                        : ventasMes != null && ventasMes > 0 ? '100%' : '0%',
                    }}
                  />
                </div>
                <div className="farmacia-dashboard-bar-label muted">
                  <span>Mes anterior</span>
                  <span>{ventasAnterior != null ? `$ ${ventasAnterior.toLocaleString()}` : '—'}</span>
                </div>
              </div>
            </div>

            <div className="card farmacia-dashboard-chart-card">
              <h3>Crecimiento de usuarios (app)</h3>
              {usuariosCrecimiento != null ? (
                <div className={`farmacia-dashboard-indicator ${usuariosCrecimiento >= 0 ? 'positive' : 'negative'}`}>
                  <span className="farmacia-dashboard-indicator-value">
                    {usuariosCrecimiento >= 0 ? '+' : ''}{usuariosCrecimiento.toFixed(1)}%
                  </span>
                  <span className="muted">respecto al período anterior</span>
                </div>
              ) : (
                <p className="muted">Sin datos de variación aún.</p>
              )}
            </div>

            <div className="card farmacia-dashboard-chart-card">
              <h3>Inventario: tendencia</h3>
              {inventarioVar != null ? (
                <div className={`farmacia-dashboard-indicator ${inventarioVar >= 0 ? 'positive' : 'negative'}`}>
                  <span className="farmacia-dashboard-indicator-value">
                    {inventarioVar >= 0 ? 'Crecimiento' : 'Decadencia'}
                  </span>
                  <span className="muted">{inventarioVar >= 0 ? '+' : ''}{inventarioVar.toFixed(1)}%</span>
                </div>
              ) : (
                <p className="muted">Sin datos de variación aún.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
