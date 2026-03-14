import { useState } from 'react'
import { clienteApi, type RecetaBuscarItem } from '../../api'
import { analizarRecetaDesdeImagen } from '../../services/geminiRecetas'
import './ClienteRecetas.css'

/** Resultado por medicamento detectado: búsqueda en catálogo (puede haber 0 o más coincidencias). */
interface ResultadoMedicamento {
  nombreDetectado: string
  items: RecetaBuscarItem[]
}

function IconCartSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

export default function ClienteRecetas() {
  const [textoReceta, setTextoReceta] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultados, setResultados] = useState<RecetaBuscarItem[]>([])
  const [resultadosPorMedicamento, setResultadosPorMedicamento] = useState<ResultadoMedicamento[]>([])
  const [analisisDesdeImagen, setAnalisisDesdeImagen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analizarReceta() {
    const q = textoReceta.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResultados([])
    setResultadosPorMedicamento([])
    setAnalisisDesdeImagen(false)
    try {
      const encontrados = await clienteApi.recetasBuscar(q)
      for (const item of encontrados) {
        const cantidad = 1
        if (item.codigo) {
          await clienteApi.recetasAgregarAlCarrito({ codigo: item.codigo, cantidad })
        } else if (item.id) {
          await clienteApi.recetasAgregarAlCarrito({ productoId: item.id, cantidad })
        }
      }
      setResultados(encontrados)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al analizar la receta')
      setResultados([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyzeRecipe(file: File | null) {
    if (!file) return
    const tipoValido = file.type.startsWith('image/')
    if (!tipoValido) {
      setError('Selecciona una imagen (JPG, PNG, etc.). Ese archivo no es una imagen.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen es muy pesada (máx. 10 MB). Prueba con una de menor tamaño.')
      return
    }
    setLoading(true)
    setError(null)
    setResultados([])
    setResultadosPorMedicamento([])
    try {
      const analisis = await analizarRecetaDesdeImagen(file)
      if (!analisis.es_recipe_valido || !analisis.medicamentos.length) {
        setError('No se pudo detectar un récipe médico válido en la imagen.')
        return
      }

      if (analisis.texto_receta) {
        setTextoReceta(analisis.texto_receta)
      }

      const porMedicamento: ResultadoMedicamento[] = []
      for (const med of analisis.medicamentos) {
        const q = `${med.nombre} ${med.concentracion}`.trim()
        if (!q) continue
        const encontrados = await clienteApi.recetasBuscar(q)
        porMedicamento.push({ nombreDetectado: [med.nombre, med.concentracion].filter(Boolean).join(' '), items: encontrados })
      }

      setResultadosPorMedicamento(porMedicamento)
      setAnalisisDesdeImagen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al analizar la imagen de la receta'
      const lower = msg.toLowerCase()
      if (msg === 'SERVICIO_NO_DISPONIBLE') {
        setError(
          'El análisis de imagen no está disponible por el momento. Usa el cuadro de texto de arriba: pega el contenido de tu receta o el resultado de un escáner OCR.'
        )
        setResultados([])
        return
      }
      const noSePudoLeer =
        lower.includes('imposible') ||
        lower.includes('impossible') ||
        lower.includes('no se pudo leer') ||
        lower.includes('unable to read') ||
        lower.includes('cannot read') ||
        lower.includes('no pudo leer') ||
        lower.includes('no se pudo analizar')
      if (noSePudoLeer) {
        setError(
          'No se pudo leer la imagen. Prueba con una foto más nítida y bien iluminada del récipe, o escribe/pega el texto en el cuadro de arriba.'
        )
      } else {
        setError(msg)
      }
      setResultados([])
      setResultadosPorMedicamento([])
    } finally {
      setLoading(false)
    }
  }

  async function agregarAlCarrito(item: RecetaBuscarItem) {
    try {
      if (item.codigo) {
        await clienteApi.recetasAgregarAlCarrito({ codigo: item.codigo, cantidad: 1 })
      } else if (item.id) {
        await clienteApi.recetasAgregarAlCarrito({ productoId: item.id, cantidad: 1 })
      }
    } catch {
      // silent
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
          Puedes usar una app de escaneo para convertir tu receta en texto y pegarla aquí, o subir una foto y al darle a &quot;Analizar receta&quot; el texto aparecerá aquí automáticamente.
        </p>
        <div className="form-group">
          <textarea
            id="recetas-texto"
            rows={4}
            placeholder="Pega aquí el texto de tu receta o sube una foto y analízala para que aparezca aquí..."
            value={textoReceta}
            onChange={(e) => setTextoReceta(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={analizarReceta} disabled={loading}>
            {loading ? 'Analizando receta...' : 'Analizar receta y agregar al carrito'}
          </button>
        </div>
        <hr />
        <div className="form-group">
          <label htmlFor="recetas-imagen">O sube una foto del récipe</label>
          <input
            id="recetas-imagen"
            type="file"
            accept="image/*"
            onChange={(e) => handleAnalyzeRecipe(e.target.files?.[0] ?? null)}
          />
          <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
            Al analizar la foto, el texto de la receta se mostrará arriba y podrás ver cada medicamento con disponibilidad y agregar al carrito o solicitar.
          </p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {analisisDesdeImagen && resultadosPorMedicamento.length > 0 && (
        <div className="card cliente-recetas-resultados">
          <h3>Medicamentos detectados en tu receta</h3>
          <p className="muted">
            Revisa la disponibilidad de cada uno. Si está disponible, agrégalo al carrito; si no, puedes solicitarlo.
          </p>
          <ul className="cliente-recetas-lista cliente-recetas-lista-por-med">
            {resultadosPorMedicamento.map((rm, idx) => (
              <li key={idx} className="cliente-recetas-item-med">
                <span className="cliente-recetas-med-nombre">{rm.nombreDetectado}</span>
                {rm.items.length === 0 ? (
                  <div className="cliente-recetas-item-actions">
                    <span className="muted">Sin coincidencias en catálogo</span>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { /* TODO: solicitar por nombre */ }}>
                      Solicitar
                    </button>
                  </div>
                ) : (
                  rm.items.map((item) => (
                    <div key={item.id} className="cliente-recetas-item-row">
                      <div className="cliente-recetas-item-info">
                        <strong>{item.descripcion || item.codigo || 'Producto'}</strong>
                        {item.codigo && item.descripcion && <span className="muted"> · {item.codigo}</span>}
                        {typeof item.precio === 'number' && <span className="precio"> $ {item.precio.toFixed(2)}</span>}
                      </div>
                      <div className="cliente-recetas-item-actions">
                        {(item.existencia == null || item.existencia > 0) ? (
                          <>
                            <span className="cliente-recetas-disp">Disponible</span>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm cliente-recetas-btn-cart"
                              onClick={() => agregarAlCarrito(item)}
                              title="Agregar al carrito"
                            >
                              <IconCartSmall />
                            </button>
                          </>
                        ) : (
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { /* TODO: solicitar producto */ }}>
                            Solicitar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!analisisDesdeImagen && resultados.length > 0 && (
        <div className="card cliente-recetas-resultados">
          <h3>Medicamentos detectados en tu receta</h3>
          <p className="muted">
            Estos productos se han agregado al carrito. Revisa tu carrito para ajustar cantidades si lo necesitas.
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

      {!loading && textoReceta.trim() && resultados.length === 0 && !resultadosPorMedicamento.length && (
        <div className="card">
          <p className="muted">No hay resultados en el catálogo para tu búsqueda. Prueba con otro término (mismo criterio que en Catálogo).</p>
        </div>
      )}
    </div>
  )
}
