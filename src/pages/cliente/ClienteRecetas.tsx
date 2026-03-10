import { useState } from 'react'
import { catalogoApi, carritoApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { itemsDesdeRespuestaCatalogo } from '../../utils/catalogo'
import type { Producto } from '../../types'
import './ClienteRecetas.css'

export default function ClienteRecetas() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultados, setResultados] = useState<Producto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const [enviando, setEnviando] = useState(false)

  async function buscar() {
    const q = textoBusqueda.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResultados([])
    try {
      const res = await catalogoApi.listar({ q, page: 1, page_size: 24 })
      const items = itemsDesdeRespuestaCatalogo(res as unknown as Record<string, unknown>)
      setResultados(items)
      setCantidades({})
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al buscar')
      setResultados([])
    } finally {
      setLoading(false)
    }
  }

  function setCant(id: string, value: number) {
    setCantidades((prev) => ({ ...prev, [id]: Math.max(0, value) }))
  }

  async function agregarAlCarrito(item: Producto) {
    const cant = cantidades[item.id] ?? 1
    if (cant < 1) return
    const existencia = item.existencia ?? 0
    if (item.disponible === false || existencia <= 0) {
      setError('El producto no tiene stock disponible.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      addItem(item, cant, item.farmaciaId)
      if (user) {
        const resp = await carritoApi.agregar({
          cliente_id: user.id,
          producto_id: item.id,
          cantidad: cant,
        })
        if (resp.status === 'conflicto_farmacia') {
          const aceptar = window.confirm(
            'Estás agregando productos de otro comercio. El delivery y tiempos pueden variar. ¿Deseas continuar?'
          )
          if (aceptar && user) {
            await carritoApi.cambiarFarmacia({
              cliente_id: user.id,
              farmacia_id: item.farmaciaId,
            })
          }
        }
      }
      setCantidades((prev) => ({ ...prev, [item.id]: 0 }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al agregar al carrito')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="container cliente-recetas">
      <h2>Recetas</h2>
      <p className="muted">
        Busca en el mismo catálogo que en la página principal: escribe el nombre del medicamento o pega el texto de tu receta (si usas OCR, pega aquí el resultado para buscar).
      </p>

      <div className="card cliente-recetas-buscar">
        <label htmlFor="recetas-q">Buscar en el catálogo (mismo que en Catálogo)</label>
        <p className="muted" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mismo buscador que Recordatorios y Catálogo.</p>
        <div className="form-group">
          <input
            id="recetas-q"
            type="search"
            placeholder="Ej: Paracetamol 500mg, Ibuprofeno..."
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
          />
          <button type="button" className="btn btn-primary" onClick={buscar} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {resultados.length > 0 && (
        <div className="card cliente-recetas-resultados">
          <h3>Resultados del catálogo</h3>
          <p className="muted">Mismos productos que en Catálogo. Elige cantidad y agrega al carrito.</p>
          <ul className="cliente-recetas-lista">
            {resultados.map((item) => {
              const sinStock = item.disponible === false || (typeof item.existencia === 'number' && item.existencia <= 0)
              const precio = item.precioConPorcentaje ?? item.precio
              return (
                <li key={item.id} className="cliente-recetas-item">
                  <div className="cliente-recetas-item-info">
                    <strong>{item.descripcion || item.codigo}</strong>
                    {item.codigo && item.descripcion && <span className="muted"> · {item.codigo}</span>}
                    {typeof precio === 'number' && <span className="precio">$ {precio.toFixed(2)}</span>}
                    {item.existencia != null && <span className="muted"> · {item.existencia} disp.</span>}
                    {sinStock && <span className="cliente-recetas-sin-stock">Sin stock</span>}
                  </div>
                  <div className="cliente-recetas-item-actions">
                    <input
                      type="number"
                      min={1}
                      value={cantidades[item.id] ?? 1}
                      onChange={(e) => setCant(item.id, parseInt(e.target.value, 10) || 0)}
                      disabled={sinStock}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={enviando || sinStock}
                      onClick={() => agregarAlCarrito(item)}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {!loading && textoBusqueda.trim() && resultados.length === 0 && (
        <div className="card">
          <p className="muted">No hay resultados en el catálogo para tu búsqueda. Prueba con otro término (mismo criterio que en Catálogo).</p>
        </div>
      )}
    </div>
  )
}
