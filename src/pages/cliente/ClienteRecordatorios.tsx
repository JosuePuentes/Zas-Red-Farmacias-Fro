import { useEffect, useState } from 'react'
import { catalogoApi, clienteApi, buildProductImageUrl, type RecordatorioItem } from '../../api'
import { itemsDesdeRespuestaCatalogo } from '../../utils/catalogo'
import './ClienteRecordatorios.css'

function formatCountdown(proximaFecha: string | undefined): string {
  if (!proximaFecha) return '—'
  const next = new Date(proximaFecha)
  const now = new Date()
  const diff = next.getTime() - now.getTime()
  if (diff <= 0) return 'Hoy'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days} d ${hours} h`
  return `${hours} h`
}

export default function ClienteRecordatorios() {
  const [list, setList] = useState<RecordatorioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [resultadosCatalogo, setResultadosCatalogo] = useState<{ id: string; codigo: string; descripcion: string; imagen?: string; precio?: number }[]>([])
  const [agregando, setAgregando] = useState(false)

  useEffect(() => {
    let cancelled = false
    clienteApi.recordatorios()
      .then((data) => { if (!cancelled) setList(Array.isArray(data) ? data : []) })
      .catch((e) => { if (!cancelled) { setError(e instanceof Error ? e.message : 'Error al cargar'); setList([]) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function buscarEnCatalogo() {
    const q = busqueda.trim()
    if (!q) {
      setResultadosCatalogo([])
      return
    }
    setError(null)
    try {
      const res = await catalogoApi.listar({ q, page: 1, page_size: 20 })
      const items = itemsDesdeRespuestaCatalogo(res as unknown as Record<string, unknown>)
      setResultadosCatalogo(
        items.map((p) => ({
          id: p.id,
          codigo: p.codigo,
          descripcion: p.descripcion || p.codigo,
          imagen: p.imagen,
          precio: p.precioConPorcentaje ?? p.precio ?? undefined,
        })),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al buscar')
      setResultadosCatalogo([])
    }
  }

  // Búsqueda en tiempo real mientras el usuario escribe (con pequeño debounce)
  useEffect(() => {
    const id = window.setTimeout(() => {
      void buscarEnCatalogo()
    }, 400)
    return () => window.clearTimeout(id)
  }, [busqueda])

  async function agregarRecordatorio(item: { id: string; codigo: string; descripcion: string; imagen?: string; precio?: number }) {
    setAgregando(true)
    setError(null)
    try {
      await clienteApi.crearRecordatorio({
        codigo: item.codigo,
        descripcion: item.descripcion,
        imagen: item.imagen,
        precioReferencia: item.precio,
      })
      setList((prev) => [...prev, { id: item.id, codigo: item.codigo, descripcion: item.descripcion, imagen: item.imagen, precioReferencia: item.precio }])
      setResultadosCatalogo((prev) => prev.filter((r) => r.id !== item.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al agregar recordatorio')
    } finally {
      setAgregando(false)
    }
  }

  return (
    <div className="container cliente-recordatorios">
      <h2>Recordatorios</h2>
      <p className="muted">Medicamentos que quieres recordar. Busca aquí con el mismo catálogo que en la página principal.</p>

      <div className="card cliente-recordatorios-buscar">
        <h3>Buscar en el catálogo</h3>
        <p className="muted" style={{ marginBottom: '0.75rem' }}>Mismo buscador que en Catálogo: escribe código o nombre del producto.</p>
        <div className="form-group">
          <input
            type="search"
            placeholder="Buscar en catálogo (mismo que en Catálogo)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {resultadosCatalogo.length > 0 && (
          <ul className="cliente-recordatorios-resultados">
            {resultadosCatalogo.map((item) => (
              <li key={item.id} className="card">
                {(() => {
                  const imgUrl = buildProductImageUrl(item.imagen)
                  return imgUrl ? <img src={imgUrl} alt="" className="cliente-recordatorios-thumb" /> : null
                })()}
                <div>
                  <strong>{item.descripcion}</strong>
                  <span className="muted"> {item.codigo}</span>
                  {item.precio != null && <p className="precio-ref">Precio ref. $ {item.precio.toFixed(2)}</p>}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={agregando}
                  onClick={() => agregarRecordatorio(item)}
                >
                  Agregar a recordatorios
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}
      {loading && <p className="muted">Cargando recordatorios...</p>}
      {!loading && list.length === 0 && !resultadosCatalogo.length && (
        <div className="card">
          <p className="muted">Aún no tienes recordatorios. Usa el buscador de arriba para agregar desde el catálogo.</p>
        </div>
      )}
      {!loading && list.length > 0 && (
        <ul className="cliente-recordatorios-lista">
          {list.map((r) => (
            <li key={r.id} className="card">
{(() => {
                  const imgUrl = buildProductImageUrl(r.imagen)
                  return imgUrl ? <img src={imgUrl} alt="" className="cliente-recordatorios-thumb" /> : null
                })()}
              <div className="cliente-recordatorios-info">
                <strong>{r.descripcion ?? r.codigo ?? 'Sin nombre'}</strong>
                {r.precioReferencia != null && (
                  <p className="precio-ref">Precio de referencia: $ {r.precioReferencia.toFixed(2)}</p>
                )}
                <p className="countdown">Próxima toma / compra: {formatCountdown(r.proximaFecha)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
