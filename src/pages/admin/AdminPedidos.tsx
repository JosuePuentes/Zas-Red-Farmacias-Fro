import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { masterApi, type PedidoMaster } from '../../api'
import './AdminPedidos.css'

export default function AdminPedidos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pedidos, setPedidos] = useState<PedidoMaster[]>([])
  const [loading, setLoading] = useState(true)
  const fechaDesde = searchParams.get('fechaDesde') ?? ''
  const fechaHasta = searchParams.get('fechaHasta') ?? ''
  const [localDesde, setLocalDesde] = useState(fechaDesde)
  const [localHasta, setLocalHasta] = useState(fechaHasta)

  useEffect(() => {
    const params: { fechaDesde?: string; fechaHasta?: string } = {}
    if (fechaDesde) params.fechaDesde = fechaDesde
    if (fechaHasta) params.fechaHasta = fechaHasta
    setLoading(true)
    masterApi.pedidos(Object.keys(params).length ? params : undefined)
      .then(setPedidos)
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false))
  }, [fechaDesde, fechaHasta])

  useEffect(() => {
    setLocalDesde(fechaDesde)
    setLocalHasta(fechaHasta)
  }, [fechaDesde, fechaHasta])

  function handleFiltrar(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (localDesde) params.set('fechaDesde', localDesde)
    if (localHasta) params.set('fechaHasta', localHasta)
    setSearchParams(params)
  }

  const tieneFiltro = !!(fechaDesde || fechaHasta)

  if (loading) return <p className="ped-m-loading">Cargando pedidos...</p>

  return (
    <div className="pedidos-master">
      <h2>Todos los pedidos</h2>
      <form className="ped-m-form-filtro" onSubmit={handleFiltrar}>
        <input type="date" value={localDesde} onChange={(e) => setLocalDesde(e.target.value)} />
        <span>a</span>
        <input type="date" value={localHasta} onChange={(e) => setLocalHasta(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">Filtrar</button>
        {tieneFiltro && (
          <Link to="/admin/pedidos" className="ped-m-link-todos">Ver todos</Link>
        )}
      </form>
      {tieneFiltro && (
        <p className="ped-m-filtro">
          Mostrando pedidos del {fechaDesde || '...'} al {fechaHasta || '...'}.
        </p>
      )}
      {pedidos.length === 0 ? (
        <p className="ped-m-empty">No hay pedidos.</p>
      ) : (
        <ul className="ped-m-list">
          {pedidos.map((p) => (
            <li key={p._id} className="ped-m-item card">
              <p><strong>Cliente:</strong> {p.clienteId?.nombre} {p.clienteId?.apellido} — {p.clienteId?.email}</p>
              <p><strong>Farmacia:</strong> {p.farmaciaId?.nombreFarmacia ?? '—'}</p>
              <p><strong>Total:</strong> $ {Number(p.total).toFixed(2)} | Estado: {p.estado}</p>
              {p.deliveryId && <p><strong>Delivery:</strong> {p.deliveryId?.nombre}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
