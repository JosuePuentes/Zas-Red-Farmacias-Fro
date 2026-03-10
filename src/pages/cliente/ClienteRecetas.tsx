import { useState } from 'react'
import { clienteApi, getApiBaseUrl, type RecetaBuscarItem } from '../../api'
import './ClienteRecetas.css'

const backendBase = () => getApiBaseUrl().replace(/\/api\/?$/, '')

export default function ClienteRecetas() {
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultados, setResultados] = useState<RecetaBuscarItem[]>([])
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
      const data = await clienteApi.recetasBuscar(q)
      setResultados(Array.isArray(data) ? data : [])
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

  async function agregarAlCarrito(item: RecetaBuscarItem) {
    const cant = cantidades[item.id] ?? 1
    if (cant < 1) return
    setEnviando(true)
    setError(null)
    try {
      await clienteApi.recetasAgregarAlCarrito({ productoId: item.id, cantidad: cant })
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
        Escribe el nombre del medicamento o pega el texto de tu receta (si usas escáner/OCR, pega aquí el resultado). El backend buscará coincidencias y podrás agregar al carrito.
      </p>

      <div className="card cliente-recetas-buscar">
        <label htmlFor="recetas-q">Buscar por texto o pegar texto de receta (OCR)</label>
        <div className="form-group">
          <input
            id="recetas-q"
            type="text"
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
          <h3>Coincidencias y ofertas</h3>
          <p className="muted">Elige cantidad y agrega al carrito.</p>
          <ul className="cliente-recetas-lista">
            {resultados.map((item) => (
              <li key={item.id} className="cliente-recetas-item">
                <div className="cliente-recetas-item-info">
                  <strong>{item.descripcion ?? item.codigo ?? item.id}</strong>
                  {item.precio != null && <span className="precio">$ {item.precio.toFixed(2)}</span>}
                  {item.existencia != null && <span className="muted"> · {item.existencia} disp.</span>}
                </div>
                <div className="cliente-recetas-item-actions">
                  <input
                    type="number"
                    min={1}
                    value={cantidades[item.id] ?? 1}
                    onChange={(e) => setCant(item.id, parseInt(e.target.value, 10) || 0)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={enviando}
                    onClick={() => agregarAlCarrito(item)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && textoBusqueda.trim() && resultados.length === 0 && (
        <div className="card">
          <p className="muted">No se encontraron coincidencias. Prueba con otro texto o más palabras.</p>
        </div>
      )}
    </div>
  )
}
