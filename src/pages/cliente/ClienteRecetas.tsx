import { useState } from 'react'
import { clienteApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import type { RecetaBuscarItem } from '../../api'
import './ClienteRecetas.css'

export default function ClienteRecetas() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const [textoReceta, setTextoReceta] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultados, setResultados] = useState<RecetaBuscarItem[]>([])
  const [error, setError] = useState<string | null>(null)

  async function analizarReceta() {
    const q = textoReceta.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResultados([])
    try {
      // Paso 1: backend analiza el texto de la receta y devuelve posibles productos
      const encontrados = await clienteApi.recetasBuscar(q)

      // Paso 2: agregar automáticamente al carrito (frontend + backend)
      for (const item of encontrados) {
        const cantidad = 1
        if (item.codigo) {
          await clienteApi.recetasAgregarAlCarrito({ codigo: item.codigo, cantidad })
        } else if (item.id) {
          await clienteApi.recetasAgregarAlCarrito({ productoId: item.id, cantidad })
        }
      }

      // Paso 3: mostrar resumen de lo que se detectó
      setResultados(encontrados)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al analizar la receta')
      setResultados([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container cliente-recetas">
      <h2>Recetas</h2>
      <p className="muted">
        Pega el texto de tu receta (o el resultado de un escaneo OCR) y deja que el sistema busque los medicamentos en el catálogo y los agregue automáticamente al carrito.
      </p>

      <div className="card cliente-recetas-buscar">
        <label htmlFor="recetas-texto">Texto de la receta</label>
        <p className="muted" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          Puedes usar una app de escaneo para convertir tu receta en texto y pegarla aquí.
        </p>
        <div className="form-group">
          <textarea
            id="recetas-texto"
            rows={4}
            placeholder="Pega aquí el texto de tu receta..."
            value={textoReceta}
            onChange={(e) => setTextoReceta(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={analizarReceta} disabled={loading}>
            {loading ? 'Analizando receta...' : 'Analizar receta y agregar al carrito'}
          </button>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {resultados.length > 0 && (
        <div className="card cliente-recetas-resultados">
          <h3>Medicamentos detectados en tu receta</h3>
          <p className="muted">
            Estos productos se han intentado agregar automáticamente al carrito. Revisa tu carrito para verlos y ajustar cantidades si lo necesitas.
          </p>
          <ul className="cliente-recetas-lista">
            {resultados.map((item) => (
              <li key={item.id} className="cliente-recetas-item">
                <div className="cliente-recetas-item-info">
                  <strong>{item.descripcion || item.codigo || 'Producto detectado'}</strong>
                  {item.codigo && item.descripcion && <span className="muted"> · {item.codigo}</span>}
                  {typeof item.precio === 'number' && <span className="precio">$ {item.precio.toFixed(2)}</span>}
                  {item.existencia != null && <span className="muted"> · {item.existencia} disp.</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && textoReceta.trim() && resultados.length === 0 && (
        <div className="card">
          <p className="muted">No hay resultados en el catálogo para tu búsqueda. Prueba con otro término (mismo criterio que en Catálogo).</p>
        </div>
      )}
    </div>
  )
}
