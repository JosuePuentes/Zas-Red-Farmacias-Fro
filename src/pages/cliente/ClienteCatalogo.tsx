import { useEffect, useState } from 'react'
import { useCart } from '../../context/CartContext'
import type { Producto } from '../../types'
import { clienteApi } from '../../api'
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

export default function ClienteCatalogo() {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const { addItem } = useCart()

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await clienteApi.catalogo()
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
  }, [])

  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const getCant = (id: string) => cantidades[id] ?? 1
  const setCant = (id: string, value: number) => setCantidades((c) => ({ ...c, [id]: Math.max(1, value) }))

  const productosFiltrados = productos.filter(
    (p) =>
      !busqueda.trim() ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="cliente-catalogo container">
      <p className="cliente-catalogo-hint badge badge-info">
        Los productos del mismo color están en el mismo comercio.
      </p>
      <div className="form-group">
        <input
          type="search"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="form-group">
        <label>Filtrar por estado</label>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="miranda">Miranda</option>
          <option value="caracas">Distrito Capital</option>
          <option value="zulia">Zulia</option>
        </select>
      </div>
      <ul className="cliente-catalogo-list">
        {loading && productosFiltrados.length === 0 && (
          <li className="cliente-catalogo-item card">
            <div className="cliente-catalogo-info">
              <p>Cargando catálogo...</p>
            </div>
          </li>
        )}
        {error && (
          <li className="cliente-catalogo-item card">
            <div className="cliente-catalogo-info">
              <p className="cliente-catalogo-empty">{error}</p>
            </div>
          </li>
        )}
        {productosFiltrados.map((p) => {
          const precioBase = getPrecioBase(p)
          const precioConDescuento = getPrecioConDescuento(p)
          const descuento = getDescuentoPorcentaje(p)
          const tieneDescuento = descuento > 0 && precioConDescuento < precioBase

          return (
            <li key={p.id} className="cliente-catalogo-item card product-same-store">
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
                    onClick={() => addItem(p, getCant(p.id), p.farmaciaId)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {!loading && productosFiltrados.length === 0 && (
        <p className="cliente-catalogo-empty">No hay productos que coincidan con la búsqueda.</p>
      )}
    </div>
  )
}
