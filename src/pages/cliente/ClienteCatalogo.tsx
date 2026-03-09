import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import type { Producto } from '../../types'
import { clienteApi, carritoApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { ESTADOS_VENEZUELA } from '../../constants/estados'
import { DEPARTAMENTOS_ZAS, type DepartamentoZas } from '../../constants/departamentos'
import './ClienteCatalogo.css'

const MOCK_PRODUCTOS: Producto[] = [
  {
    id: '1',
    codigo: 'COD-001',
    descripcion: 'Paracetamol 500mg',
    principioActivo: 'Paracetamol',
    presentacion: 'Caja 20 tab',
    marca: 'La Sante',
    precio: 5.5,
    descuentoPorcentaje: 10,
    precioConPorcentaje: 4.95,
    farmaciaId: 'f1',
  },
  {
    id: '2',
    codigo: 'COD-002',
    descripcion: 'Ibuprofeno 400mg',
    principioActivo: 'Ibuprofeno',
    presentacion: 'Caja 30 tab',
    marca: 'Cofasa',
    precio: 6.0,
    farmaciaId: 'f1',
  },
  {
    id: '3',
    codigo: 'COD-003',
    descripcion: 'Vitamina C 1g',
    principioActivo: 'Ácido ascórbico',
    presentacion: 'Frasco 30 tab',
    marca: 'Genven',
    precio: 8.0,
    descuentoPorcentaje: 20,
    precioConPorcentaje: 6.4,
    farmaciaId: 'f2',
  },
]

function getPrecioBase(p: Producto) {
  return p.precio
}

function getPrecioConDescuento(p: Producto) {
  return p.precioConPorcentaje ?? p.precio
}

function getDescuentoPorcentaje(p: Producto) {
  if (typeof p.descuentoPorcentaje === 'number') return p.descuentoPorcentaje
  if (p.precioConPorcentaje != null && p.precioConPorcentaje < p.precio) {
    const raw = 100 - (p.precioConPorcentaje * 100) / p.precio
    return Math.round(raw)
  }
  return 0
}

function getCategoriaProducto(p: Producto): DepartamentoZas | 'Otros' {
  if (p.categoria && DEPARTAMENTOS_ZAS.includes(p.categoria as DepartamentoZas)) {
    return p.categoria as DepartamentoZas
  }
  const desc = `${p.descripcion} ${p.principioActivo}`.toLowerCase()
  if (desc.includes('ibuprof') || desc.includes('paracetam')) return 'Analgésicos y Antipiréticos'
  if (desc.includes('antibiót') || desc.includes('amoxic') || desc.includes('ciproflox')) return 'Antibióticos'
  if (desc.includes('vitamina') || desc.includes('suplemento')) return 'Vitaminas y Suplementos'
  if (desc.includes('gel') || desc.includes('shampoo') || desc.includes('jabón')) return 'Cuidado Personal'
  return 'Otros'
}

export default function ClienteCatalogo() {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [searchParams] = useSearchParams()
  const buscarParam = searchParams.get('buscar') === '1'
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const { addItem } = useCart()
  const { user } = useAuth()

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        // Catálogo basado en nuevo endpoint GET /catalogo con buscador y paginación
        const data = await clienteApi.catalogo({
          q: busqueda.trim() || undefined,
          page,
          page_size: pageSize,
        })
        if (!cancelled) {
          setProductos(
            data.map((p) => ({
              ...p,
            }))
          )
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e)
          setError('No se pudo cargar el catálogo, mostrando datos de prueba.')
          setProductos(MOCK_PRODUCTOS)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [busqueda, page])

  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const getCant = (id: string) => cantidades[id] ?? 1
  const setCant = (id: string, value: number) => setCantidades((c) => ({ ...c, [id]: Math.max(1, value) }))

  useEffect(() => {
    if (buscarParam && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [buscarParam])

  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.trim().toLowerCase()
    if (
      q &&
      !p.descripcion.toLowerCase().includes(q) &&
      !p.codigo.toLowerCase().includes(q)
    ) {
      return false
    }
    return true
  })

  const secciones = DEPARTAMENTOS_ZAS.map((dep) => ({
    nombre: dep,
    productos: productosFiltrados.filter((p) => getCategoriaProducto(p) === dep),
  })).filter((s) => s.productos.length > 0)

  return (
    <div className="cliente-catalogo container">
      <div className="cliente-catalogo-location">
        <span className="cliente-catalogo-location-label">Ubicación</span>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todo el país</option>
          {ESTADOS_VENEZUELA.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <p className="cliente-catalogo-hint badge badge-info">
        Los productos del mismo color están en el mismo comercio.
      </p>
      {buscarParam && (
        <div className="cliente-catalogo-search-bar">
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Buscar medicamentos, vitaminas, cuidado personal..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setPage(0)
            }}
            className="search-input"
          />
        </div>
      )}
      {loading && productosFiltrados.length === 0 && (
        <p className="cliente-catalogo-empty">Cargando catálogo...</p>
      )}
      {error && (
        <p className="cliente-catalogo-empty">{error}</p>
      )}
      {!loading && secciones.length === 0 && (
        <p className="cliente-catalogo-empty">No hay productos que coincidan con la búsqueda.</p>
      )}
      {secciones.map((sec) => (
        <section key={sec.nombre} className="cliente-catalogo-section">
          <div className="cliente-catalogo-section-header">
            <h3>{sec.nombre}</h3>
          </div>
          <div className="cliente-catalogo-section-list">
            {sec.productos.map((p) => {
              const precioBase = getPrecioBase(p)
              const precioConDescuento = getPrecioConDescuento(p)
              const descuento = getDescuentoPorcentaje(p)
              const tieneDescuento = descuento > 0 && precioConDescuento < precioBase

              return (
                <article key={p.id} className="cliente-catalogo-card card product-same-store">
                  <div className="product-photo">Foto</div>
                  <div className="cliente-catalogo-info">
                    <span className="product-codigo">{p.codigo}</span>
                    <p className="product-desc">
                      {p.descripcion} · {p.presentacion}
                    </p>
                    <p className="product-desc product-marca">{p.marca}</p>
                    <p className="product-precio">
                      {tieneDescuento ? (
                        <>
                          <span className="product-precio-original">$ {precioBase.toFixed(2)}</span>
                          <span className="product-precio-descuento">
                            {descuento}% OFF · $ {precioConDescuento.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <>$ {precioBase.toFixed(2)}</>
                      )}
                    </p>
                  </div>
                  <div className="cliente-catalogo-actions">
                    <label className="cliente-catalogo-qty-label">Cantidad</label>
                    <div className="cliente-catalogo-qty">
                      <input
                        type="number"
                        min={1}
                        value={getCant(p.id)}
                        onChange={(e) => setCant(p.id, parseInt(e.target.value, 10) || 1)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={async () => {
                          const cantidad = getCant(p.id)
                          addItem(p, cantidad, p.farmaciaId)

                          if (!user) return

                          try {
                            const resp = await carritoApi.agregar({
                              cliente_id: user.id,
                              producto_id: p.id,
                              cantidad,
                            })
                            if (resp.status === 'conflicto_farmacia') {
                              const aceptar = window.confirm(
                                'Estás agregando productos de otro comercio. El delivery y tiempos pueden variar. ¿Deseas continuar?',
                              )
                              if (aceptar) {
                                await carritoApi.cambiarFarmacia({
                                  cliente_id: user.id,
                                  farmacia_id: p.farmaciaId,
                                })
                              }
                            }
                          } catch (e) {
                            console.error('Error al sincronizar carrito con backend', e)
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
      <div className="cliente-catalogo-pagination">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
        >
          ← Anterior
        </button>
        <span style={{ margin: '0 0.75rem', fontSize: '0.9rem' }}>Página {page + 1}</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || productos.length < pageSize}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
