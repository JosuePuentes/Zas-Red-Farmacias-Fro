import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { masterApi, type EstadisticasMaster } from '../../api'
import './AdminDashboard.css'

function formatDateLocal(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getRangePreset(preset: 'hoy' | 'semana' | 'mes'): { fechaDesde: string; fechaHasta: string } {
  const now = new Date()
  const today = formatDateLocal(now)
  if (preset === 'hoy') return { fechaDesde: today, fechaHasta: today }
  if (preset === 'semana') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return { fechaDesde: formatDateLocal(d), fechaHasta: today }
  }
  const d = new Date(now.getFullYear(), now.getMonth(), 1)
  return { fechaDesde: formatDateLocal(d), fechaHasta: today }
}

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [stats, setStats] = useState<EstadisticasMaster | null>(null)
  const [loading, setLoading] = useState(true)
  const desdeParam = searchParams.get('fechaDesde') ?? ''
  const hastaParam = searchParams.get('fechaHasta') ?? ''
  const [fechaDesde, setFechaDesde] = useState(desdeParam)
  const [fechaHasta, setFechaHasta] = useState(hastaParam)

  const loadStats = (desde: string, hasta: string) => {
    const params: { fechaDesde?: string; fechaHasta?: string } = {}
    if (desde) params.fechaDesde = desde
    if (hasta) params.fechaHasta = hasta
    setLoading(true)
    masterApi.estadisticas(Object.keys(params).length ? params : undefined)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setFechaDesde(desdeParam)
    setFechaHasta(hastaParam)
    loadStats(desdeParam, hastaParam)
  }, [desdeParam, hastaParam])

  function handlePreset(preset: 'hoy' | 'semana' | 'mes') {
    const { fechaDesde: d, fechaHasta: h } = getRangePreset(preset)
    setSearchParams({ fechaDesde: d, fechaHasta: h })
  }

  function handleFiltrar(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (fechaDesde) params.set('fechaDesde', fechaDesde)
    if (fechaHasta) params.set('fechaHasta', fechaHasta)
    setSearchParams(params)
  }

  function linkPedidosConFiltro(): string {
    const p = new URLSearchParams()
    if (desdeParam) p.set('fechaDesde', desdeParam)
    if (hastaParam) p.set('fechaHasta', hastaParam)
    const qs = p.toString()
    return `/admin/pedidos${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="dashboard-master">
      <h2>Panel de administración</h2>
      <p className="dash-m-desc">Estadísticas por período. Filtra por fecha para ver el histórico. Sin filtro se muestra todo el histórico.</p>

      <div className="dash-m-filtros">
        <span className="dash-m-filtros-label">Rango:</span>
        <button type="button" className="dash-m-btn-preset" onClick={() => handlePreset('hoy')}>Hoy</button>
        <button type="button" className="dash-m-btn-preset" onClick={() => handlePreset('semana')}>Esta semana</button>
        <button type="button" className="dash-m-btn-preset" onClick={() => handlePreset('mes')}>Este mes</button>
        <form className="dash-m-form-fecha" onSubmit={handleFiltrar}>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          <span>a</span>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          <button type="submit" className="dash-m-btn-filtrar">Filtrar</button>
        </form>
      </div>

      {loading ? (
        <p className="dash-m-loading">Cargando estadísticas...</p>
      ) : stats ? (
        <>
          <div className="dash-m-cards">
            <div className="dash-m-card">
              <span className="dash-m-card-value">{stats.totalPedidos}</span>
              <span className="dash-m-card-label">Pedidos totales</span>
            </div>
            <div className="dash-m-card">
              <span className="dash-m-card-value">{stats.pedidosProcesados}</span>
              <span className="dash-m-card-label">Pedidos procesados</span>
            </div>
            <div className="dash-m-card">
              <span className="dash-m-card-value">{stats.pedidosEntregados}</span>
              <span className="dash-m-card-label">Pedidos entregados</span>
            </div>
            <div className="dash-m-card">
              <span className="dash-m-card-value">{stats.totalProductosVendidos}</span>
              <span className="dash-m-card-label">Productos vendidos</span>
            </div>
            <div className="dash-m-card">
              <span className="dash-m-card-value">{stats.totalClientes}</span>
              <span className="dash-m-card-label">Clientes</span>
            </div>
            <div className="dash-m-card dash-m-card-ventas">
              <span className="dash-m-card-value">$ {Number(stats.totalVentas).toFixed(2)}</span>
              <span className="dash-m-card-label">Ventas ($)</span>
            </div>
            <div className="dash-m-card">
              <span className="dash-m-card-value">{stats.totalDelivery}</span>
              <span className="dash-m-card-label">Entregas realizadas</span>
            </div>
          </div>
          <p className="dash-m-ver-pedidos">
            <Link to={linkPedidosConFiltro()} className="dash-m-link">Ver pedidos con este filtro de fecha</Link>
          </p>
        </>
      ) : (
        <p className="dash-m-empty">No se pudieron cargar las estadísticas.</p>
      )}
    </div>
  )
}
