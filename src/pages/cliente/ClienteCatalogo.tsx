import { useEffect, useRef, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useGeolocation } from '../../context/GeolocationContext'
import type { Producto } from '../../types'
import { catalogoApi, clienteApi, carritoApi, getApiBaseUrl } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { itemsDesdeRespuestaCatalogo } from '../../utils/catalogo'
import { ESTADOS_VENEZUELA } from '../../constants/estados'
import { DEPARTAMENTOS_ZAS, type DepartamentoZas } from '../../constants/departamentos'
import './ClienteCatalogo.css'

function getPrecioBase(p: Producto): number | null {
  return typeof p.precio === 'number' ? p.precio : null
}

function getPrecioConDescuento(p: Producto): number | null {
  if (typeof p.precioConPorcentaje === 'number') return p.precioConPorcentaje
  if (typeof p.precio === 'number') return p.precio
  return null
}

function getPrecioEfectivo(p: Producto): number {
  const val = getPrecioConDescuento(p)
  return typeof val === 'number' ? val : Number.POSITIVE_INFINITY
}

function getDescuentoPorcentaje(p: Producto): number {
  const base = getPrecioBase(p)
  const desc = getPrecioConDescuento(p)
  if (typeof base === 'number' && typeof desc === 'number' && desc < base) {
    return Math.round(100 - (desc * 100) / base)
  }
  return 0
}

function sinStock(p: Producto): boolean {
  if (p.disponible === false) return true
  if (typeof p.existencia === 'number' && p.existencia <= 0) return true
  return false
}

function getCategoriaProducto(p: Producto): DepartamentoZas | 'Otros' {
  if (p.categoria && DEPARTAMENTOS_ZAS.includes(p.categoria as DepartamentoZas)) return p.categoria as DepartamentoZas
  const desc = `${p.descripcion} ${p.principioActivo}`.toLowerCase()
  if (desc.includes('ibuprof') || desc.includes('paracetam')) return 'Analgésicos y Antipiréticos'
  if (desc.includes('antibiót') || desc.includes('amoxic') || desc.includes('ciproflox')) return 'Antibióticos'
  if (desc.includes('vitamina') || desc.includes('suplemento')) return 'Vitaminas y Suplementos'
  if (desc.includes('gel') || desc.includes('shampoo') || desc.includes('jabón')) return 'Cuidado Personal'
  return 'Otros'
}

function getRecomendacionesAuxiliar(p: Producto): string[] {
  const texto = `${p.descripcion} ${p.principioActivo} ${p.presentacion}`.toLowerCase()
  const recs = new Set<string>()

  if (texto.includes('ampolla') || texto.includes('inyect') || texto.includes('intramuscular')) {
    recs.add('Jeringa 3 ml')
    recs.add('Algodón y alcohol')
  }
  if (texto.includes('jarabe') || texto.includes('suspensión') || texto.includes('suspension')) {
    recs.add('Cucharilla medidora')
  }
  if (texto.includes('tableta') || texto.includes('comprimido') || texto.includes('pastilla')) {
    recs.add('Agua filtrada')
  }
  if (texto.includes('cura') || texto.includes('herida') || texto.includes('gasa')) {
    recs.add('Vendas o gasas estériles')
  }

  return Array.from(recs)
}

/** Agrupa por codigo+descripcion y elige el de mejor precio; el resto queda en "otros". */
function agruparPorMejorPrecio(productos: Producto[]): { key: string; mejor: Producto; otros: Producto[] }[] {
  const map = new Map<string, Producto[]>()
  for (const p of productos) {
    const key = `${p.codigo}|${p.descripcion}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  const result: { key: string; mejor: Producto; otros: Producto[] }[] = []
  map.forEach((list, key) => {
    const sorted = [...list].sort((a, b) => getPrecioEfectivo(a) - getPrecioEfectivo(b))
    result.push({ key, mejor: sorted[0]!, otros: sorted.slice(1) })
  })
  return result
}

const MENSAJE_STOCK_OTRA_LOCALIDAD =
  'El comercio con mejor precio solo dispone de esa cantidad. Los demás están en otra localidad; si procedes con el pedido, el costo de envío puede variar ligeramente.'

const HERO_BANNERS = [
  {
    id: 1,
    title: 'Encuentra tus medicamentos sin ruletear farmacias',
    subtitle: 'Compara precios entre varias farmacias y recibe tu pedido en menos de 30 minutos.',
    image: '/images/zas-app.png',
  },
  {
    id: 2,
    title: 'Recetas y recordatorios en un solo lugar',
    subtitle: 'Sube tus recetas, crea recordatorios y deja que Zas! se encargue del resto.',
    image: '/images/zas-recetas.png',
  },
  {
    id: 3,
    title: 'Promociones y descuentos en tus marcas favoritas',
    subtitle: 'Aprovecha ofertas de laboratorios y farmacias aliadas sin salir de casa.',
    image: '/images/zas-promos.png',
  },
]

type ClienteCatalogoProps = {
  showDeliveryBox?: boolean
  showInlineFilters?: boolean
  showLocationSelect?: boolean
  showQuickSearch?: boolean
}

export default function ClienteCatalogo({
  showDeliveryBox = true,
  showInlineFilters = true,
  showLocationSelect = true,
  showQuickSearch = true,
}: ClienteCatalogoProps) {
  const [searchParams] = useSearchParams()
  const [busqueda, setBusqueda] = useState(() => searchParams.get('q') ?? '')
  const [estado, setEstado] = useState('')
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const { addItem, items: cartItems } = useCart()
  const { user } = useAuth()
  const { position, requestLocation, loading: gpsLoading, error: gpsError } = useGeolocation()

  const [productos, setProductos] = useState<Producto[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 48

  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false)
  const [costoDelivery, setCostoDelivery] = useState<number | null>(null)
  const [loadingDelivery, setLoadingDelivery] = useState(false)
  const [modalOtrosComercios, setModalOtrosComercios] = useState<{ mejor: Producto; otros: Producto[] } | null>(null)
  const [solicitandoCodigo, setSolicitandoCodigo] = useState<string | null>(null)
  const [solicitudMsg, setSolicitudMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const [orden, setOrden] = useState<'relevancia' | 'precio-asc' | 'precio-desc'>('relevancia')
  const [filtroCategorias, setFiltroCategorias] = useState<string[]>([])
  const [filtroMarcas, setFiltroMarcas] = useState<string[]>([])
  const [panelFiltros, setPanelFiltros] = useState<'orden' | 'categoria' | 'marca' | null>(null)

  const coords = position

  // Base para imágenes del backend: VITE_API_URL (sin /api) o window.location.origin
  const backendBase = useMemo(() => {
    const apiBase = getApiBaseUrl()
    return apiBase.replace(/\/api\/?$/, '')
  }, [])

  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_BANNERS.length)
    }, 6500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const params: { q?: string; page: number; page_size: number; lat?: number; lng?: number } = {
          page: page + 1,
          page_size: pageSize,
        }
        if (busqueda.trim()) params.q = busqueda.trim()
        if (ubicacionConfirmada && coords) {
          params.lat = coords.lat
          params.lng = coords.lng
        }
        const res = await catalogoApi.listar(params)
        const data = (res as { data?: typeof res }).data ?? res
        const totalRes = (data as { total?: number }).total ?? 0
        const totalPagesRes = (data as { total_pages?: number }).total_pages ?? (data as { totalPages?: number }).totalPages ?? 1
        if (!cancelled) {
          setProductos(itemsDesdeRespuestaCatalogo(res as unknown as Record<string, unknown>))
          setTotal(totalRes)
          setTotalPages(Math.max(1, totalPagesRes))
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e)
          const msg = e instanceof Error ? e.message : ''
          if (msg && msg.toLowerCase().includes('no autorizado')) {
            setError('Este catálogo necesita que inicies sesión para mostrar productos desde el backend.')
          } else {
            setError('No se pudo cargar el catálogo. Intenta de nuevo en unos segundos.')
          }
          setProductos([])
          setTotal(0)
          setTotalPages(1)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [busqueda, page, ubicacionConfirmada, coords?.lat, coords?.lng])

  useEffect(() => {
    if (!ubicacionConfirmada || !coords) return
    let cancelled = false
    setLoadingDelivery(true)
    clienteApi.estimacionDelivery(coords.lat, coords.lng)
      .then((res) => { if (!cancelled) setCostoDelivery(res.costo ?? 0) })
      .catch(() => { if (!cancelled) setCostoDelivery(null) })
      .finally(() => { if (!cancelled) setLoadingDelivery(false) })
    return () => { cancelled = true }
  }, [ubicacionConfirmada, coords?.lat, coords?.lng, cartItems.length])

  async function handleConfirmarUbicacion() {
    const loc = await requestLocation()
    if (loc) {
      setUbicacionConfirmada(true)
      setLoadingDelivery(true)
      try {
        // Guardar ubicación en backend
        await clienteApi.guardarUbicacion(loc.lat, loc.lng)
        const res = await clienteApi.estimacionDelivery(loc.lat, loc.lng)
        setCostoDelivery(res.costo ?? 0)
      } catch {
        setCostoDelivery(null)
      } finally {
        setLoadingDelivery(false)
      }
    }
  }

  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const getCant = (id: string) => cantidades[id] ?? 1
  const setCant = (id: string, value: number) => setCantidades((c) => ({ ...c, [id]: Math.max(1, value) }))

  useEffect(() => {
    if (searchParams.get('buscar') === '1' && searchInputRef.current) searchInputRef.current.focus()
    const q = searchParams.get('q') ?? ''
    setBusqueda(q)
  }, [searchParams])

  const categoriasDisponibles = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria).filter((c): c is string => !!c))).sort(),
    [productos],
  )
  const marcasDisponibles = useMemo(
    () => Array.from(new Set(productos.map((p) => p.marca).filter((m): m is string => !!m))).sort(),
    [productos],
  )

  const productosFiltrados = useMemo(() => {
    let lista = productos
    if (filtroCategorias.length) {
      lista = lista.filter((p) => p.categoria && filtroCategorias.includes(p.categoria))
    }
    if (filtroMarcas.length) {
      lista = lista.filter((p) => p.marca && filtroMarcas.includes(p.marca))
    }
    if (orden !== 'relevancia') {
      lista = [...lista].sort((a, b) => {
        const pa = getPrecioEfectivo(a)
        const pb = getPrecioEfectivo(b)
        if (!Number.isFinite(pa) && !Number.isFinite(pb)) return 0
        if (!Number.isFinite(pa)) return 1
        if (!Number.isFinite(pb)) return -1
        return orden === 'precio-asc' ? pa - pb : pb - pa
      })
    }
    return lista
  }, [productos, filtroCategorias, filtroMarcas, orden])

  const tieneFiltrosActivos = useMemo(
    () => orden !== 'relevancia' || filtroCategorias.length > 0 || filtroMarcas.length > 0,
    [orden, filtroCategorias.length, filtroMarcas.length],
  )

  const grupos = useMemo(() => agruparPorMejorPrecio(productosFiltrados), [productosFiltrados])
  const secciones = useMemo(() => {
    const conCategoria = DEPARTAMENTOS_ZAS.map((dep) => ({
      nombre: dep,
      grupos: grupos.filter((g) => getCategoriaProducto(g.mejor) === dep),
    })).filter((s) => s.grupos.length > 0)
    const otros = grupos.filter((g) => getCategoriaProducto(g.mejor) === 'Otros')
    if (otros.length > 0) {
      return [...conCategoria, { nombre: 'Otros' as const, grupos: otros }]
    }
    return conCategoria
  }, [grupos])

  const cartFarmaciaIds = useMemo(() => new Set(cartItems.map((i) => i.farmaciaId)), [cartItems])
  const isLoggedIn = !!user
  const hero = HERO_BANNERS[heroIndex]

  return (
    <div className="cliente-catalogo container">
      {showDeliveryBox && (
        <>
          <div className="cliente-catalogo-delivery">
            <span className="cliente-catalogo-delivery-label">Costo del delivery:</span>
            <span className="cliente-catalogo-delivery-monto">
              {loadingDelivery ? '…' : costoDelivery != null ? `$ ${costoDelivery.toFixed(2)}` : '—'}
            </span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleConfirmarUbicacion}
              disabled={gpsLoading}
            >
              {gpsLoading ? 'Obteniendo…' : ubicacionConfirmada ? 'Ubicación confirmada' : 'Confirmar ubicación'}
            </button>
          </div>
          {gpsError && <p className="auth-error" style={{ marginTop: 4, marginBottom: 0 }}>{gpsError}</p>}
        </>
      )}
      <section className="cliente-catalogo-hero">
        <div className="cliente-catalogo-hero-text">
          <h2>{hero.title}</h2>
          <p>{hero.subtitle}</p>
          <div className="cliente-catalogo-hero-dots">
            {HERO_BANNERS.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                className={`hero-dot ${idx === heroIndex ? 'active' : ''}`}
                onClick={() => setHeroIndex(idx)}
                aria-label={`Ver banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="cliente-catalogo-hero-banner">
          <img src={hero.image} alt={hero.title} />
        </div>
      </section>
      {showLocationSelect && (
        <div className="cliente-catalogo-location">
          <span className="cliente-catalogo-location-label">Ubicación</span>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todo el país</option>
            {ESTADOS_VENEZUELA.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      )}
      {showInlineFilters && (
        <div className="cliente-catalogo-filters">
          <button
            type="button"
            className={`cliente-filter-chip ${panelFiltros === 'orden' ? 'is-active' : ''}`}
            onClick={() => setPanelFiltros(panelFiltros === 'orden' ? null : 'orden')}
          >
            Ordenar
          </button>
          <button
            type="button"
            className={`cliente-filter-chip ${panelFiltros === 'categoria' ? 'is-active' : ''}`}
            onClick={() => setPanelFiltros(panelFiltros === 'categoria' ? null : 'categoria')}
          >
            Categoría
          </button>
          <button
            type="button"
            className={`cliente-filter-chip ${panelFiltros === 'marca' ? 'is-active' : ''}`}
            onClick={() => setPanelFiltros(panelFiltros === 'marca' ? null : 'marca')}
          >
            Marca
          </button>
        </div>
      )}
      {showInlineFilters && panelFiltros === 'orden' && (
        <div className="cliente-filters-panel">
          <p className="cliente-filters-title">Ordenar por</p>
          <label className="cliente-filters-option">
            <input
              type="radio"
              name="orden"
              value="relevancia"
              checked={orden === 'relevancia'}
              onChange={() => setOrden('relevancia')}
            />
            Relevancia
          </label>
          <label className="cliente-filters-option">
            <input
              type="radio"
              name="orden"
              value="precio-asc"
              checked={orden === 'precio-asc'}
              onChange={() => setOrden('precio-asc')}
            />
            Precio más bajo
          </label>
          <label className="cliente-filters-option">
            <input
              type="radio"
              name="orden"
              value="precio-desc"
              checked={orden === 'precio-desc'}
              onChange={() => setOrden('precio-desc')}
            />
            Precio más alto
          </label>
        </div>
      )}
      {showInlineFilters && panelFiltros === 'categoria' && categoriasDisponibles.length > 0 && (
        <div className="cliente-filters-panel">
          <p className="cliente-filters-title">Filtrar por categoría</p>
          {categoriasDisponibles.map((c) => (
            <label key={c} className="cliente-filters-option">
              <input
                type="checkbox"
                checked={filtroCategorias.includes(c)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFiltroCategorias((prev) => [...prev, c])
                  } else {
                    setFiltroCategorias((prev) => prev.filter((x) => x !== c))
                  }
                  setPage(0)
                }}
              />
              {c}
            </label>
          ))}
        </div>
      )}
      {showInlineFilters && panelFiltros === 'marca' && marcasDisponibles.length > 0 && (
        <div className="cliente-filters-panel">
          <p className="cliente-filters-title">Filtrar por marca</p>
          {marcasDisponibles.map((m) => (
            <label key={m} className="cliente-filters-option">
              <input
                type="checkbox"
                checked={filtroMarcas.includes(m)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFiltroMarcas((prev) => [...prev, m])
                  } else {
                    setFiltroMarcas((prev) => prev.filter((x) => x !== m))
                  }
                  setPage(0)
                }}
              />
              {m}
            </label>
          ))}
        </div>
      )}
      {solicitudMsg && (
        <p className={`cliente-catalogo-solicitud-msg ${solicitudMsg.tipo === 'error' ? 'error' : 'ok'}`} role="status">
          {solicitudMsg.texto}
        </p>
      )}
      <p className="cliente-catalogo-hint badge badge-info">
        Los productos del mismo comercio se muestran resaltados. Así evitas que el delivery se sume de varios comercios.
      </p>
      <div className="cliente-catalogo-search-bar">
        <input
          ref={searchInputRef}
          type="search"
          placeholder="Buscar medicamentos, vitaminas, cuidado personal..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPage(0) }}
          className="search-input"
          aria-label="Buscar en el catálogo"
        />
      </div>
      {showQuickSearch && (
        <div className="cliente-catalogo-quicksearch">
          <span className="quicksearch-label">Búsquedas rápidas:</span>
          <button
            type="button"
            className="quicksearch-chip"
            onClick={() => { setBusqueda('paracetamol'); setPage(0) }}
          >
            Paracetamol
          </button>
          <button
            type="button"
            className="quicksearch-chip"
            onClick={() => { setBusqueda('antigripal'); setPage(0) }}
          >
            Antigripales
          </button>
          <button
            type="button"
            className="quicksearch-chip"
            onClick={() => { setBusqueda('vitamina'); setPage(0) }}
          >
            Vitaminas
          </button>
          <button
            type="button"
            className="quicksearch-chip"
            onClick={() => { setBusqueda('bebe'); setPage(0) }}
          >
            Bebés
          </button>
        </div>
      )}

      {loading && productos.length === 0 && (
        <div className="cliente-catalogo-skeleton-grid">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="cliente-catalogo-skeleton-card">
              <div className="skeleton skeleton-img" />
              <div className="skeleton skeleton-line skeleton-line-sm" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line skeleton-line-sm" />
            </div>
          ))}
        </div>
      )}
      {error && <p className="cliente-catalogo-empty">{error}</p>}
      {!loading && productos.length === 0 && (
        <p className="cliente-catalogo-empty">
          {busqueda.trim() ? 'No hay resultados para tu búsqueda. Prueba con otro término.' : 'No hay productos en el catálogo. Prueba más tarde o contacta al administrador.'}
        </p>
      )}
      {!loading && productos.length > 0 && total > 0 && (
        <>
          <p className="cliente-catalogo-total" role="status">
            {total.toLocaleString()} resultado{total !== 1 ? 's' : ''} {totalPages > 1 ? `· Página ${page + 1} de ${totalPages}` : ''}
          </p>
          <p className="cliente-catalogo-total-subhint">
            Mostramos un solo producto por código con el mejor precio entre todas las farmacias.
          </p>
        </>
      )}

      {tieneFiltrosActivos && (
        <div className="cliente-catalogo-filters-active">
          <span>
            Estás viendo resultados con filtros aplicados
            {orden !== 'relevancia' ? ' (ordenados por precio)' : ''}.
          </span>
          <button
            type="button"
            className="cliente-catalogo-filters-clear"
            onClick={() => {
              setOrden('relevancia')
              setFiltroCategorias([])
              setFiltroMarcas([])
              setPage(0)
            }}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {secciones.map((sec) => (
        <section key={sec.nombre} className="cliente-catalogo-section">
          <div className="cliente-catalogo-section-header">
            <h3>{sec.nombre}</h3>
          </div>
          <div className="cliente-catalogo-section-list">
            {sec.grupos.map(({ key, mejor, otros }) => {
              const p = mejor
              const precioBase = getPrecioBase(p)
              const precioConDescuento = getPrecioConDescuento(p)
              const descuento = getDescuentoPorcentaje(p)
              const tienePrecio = typeof precioBase === 'number' || typeof precioConDescuento === 'number'
              const tieneDescuento =
                descuento > 0 &&
                typeof precioConDescuento === 'number' &&
                typeof precioBase === 'number' &&
                precioConDescuento < precioBase
              const sinStockProducto = sinStock(p)
              const esMismoComercio = cartFarmaciaIds.has(p.farmaciaId)
              const esOtroComercio = cartItems.length > 0 && !esMismoComercio

              const todasOfertas = [mejor, ...otros]
              const preciosEfectivos = todasOfertas
                .map((x) => getPrecioEfectivo(x))
                .filter((v) => Number.isFinite(v) && v > 0)
              const precioMin = preciosEfectivos.length ? Math.min(...preciosEfectivos) : null
              const precioMax = preciosEfectivos.length ? Math.max(...preciosEfectivos) : null

              const imagenUrl =
                p.imagen && !p.imagen.startsWith('http')
                  ? `${backendBase}/${p.imagen.replace(/^\/+/, '')}`
                  : p.imagen

              const recomendacionesAux = getRecomendacionesAuxiliar(p)

              return (
                <article
                  key={key}
                  className={`cliente-catalogo-card card ${esMismoComercio ? 'producto-mismo-comercio' : ''}`}
                >
                  <div className="product-photo">
                    {ubicacionConfirmada && (
                      <span className="producto-badge-entrega">
                        Entrega &lt; 30 min
                      </span>
                    )}
                    {tieneDescuento && descuento > 0 && (
                      <span className="producto-badge-descuento">
                        -{descuento}%
                      </span>
                    )}
                    {imagenUrl ? (
                      <img src={imagenUrl} alt={p.descripcion} className="product-photo-img" />
                    ) : (
                      <span className="product-photo-placeholder">Sin imagen</span>
                    )}
                  </div>
                  <div className="cliente-catalogo-info">
                    <span className="product-codigo">{p.codigo}</span>
                    <p className="product-desc">{(p.descripcion || p.codigo)}{p.presentacion ? ` · ${p.presentacion}` : ''}</p>
                    {p.marca && <p className="product-desc product-marca">{p.marca}</p>}
                    {isLoggedIn && sinStockProducto && (
                      <>
                        <p className="product-sin-stock" role="status">Sin stock</p>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm product-solicitar-btn"
                          disabled={solicitandoCodigo === p.codigo}
                          onClick={async () => {
                            setSolicitandoCodigo(p.codigo)
                            setSolicitudMsg(null)
                            try {
                              const res = await clienteApi.solicitarProducto(p.codigo)
                              if (res.ok) {
                                setSolicitudMsg({ tipo: 'ok', texto: res.message || 'Solicitud registrada. Te avisaremos cuando esté disponible.' })
                              } else {
                                let texto = res.message || 'No se pudo enviar la solicitud.'
                                if (res.proximaDisponible) texto += ` Puedes volver a solicitar a partir del ${res.proximaDisponible}.`
                                setSolicitudMsg({ tipo: 'error', texto })
                              }
                            } catch (e) {
                              setSolicitudMsg({ tipo: 'error', texto: e instanceof Error ? e.message : 'Error al enviar la solicitud.' })
                            } finally {
                              setSolicitandoCodigo(null)
                            }
                          }}
                        >
                          {solicitandoCodigo === p.codigo ? 'Enviando...' : 'Solicitar producto'}
                        </button>
                      </>
                    )}
                    <p className="product-precio">
                      {tienePrecio ? (
                        tieneDescuento && typeof precioBase === 'number' && typeof precioConDescuento === 'number' ? (
                          <>
                            <span className="product-precio-original">$ {precioBase.toFixed(2)}</span>
                            <span className="product-precio-descuento">
                              {descuento}% OFF · $ {precioConDescuento.toFixed(2)}
                            </span>
                          </>
                        ) : typeof (precioConDescuento ?? precioBase) === 'number' ? (
                          <>$ {(precioConDescuento ?? precioBase)!.toFixed(2)}</>
                        ) : (
                          <>Precio no disponible</>
                        )
                      ) : (
                        <>Precio no disponible</>
                      )}
                    </p>
                    {isLoggedIn && precioMin != null && precioMax != null && precioMax > precioMin && (
                      <div className="cliente-catalogo-precio-rango">
                        <span className="precio-min">Mejor precio $ {precioMin.toFixed(2)}</span>
                        <span className="precio-max">Hasta $ {precioMax.toFixed(2)}</span>
                      </div>
                    )}
                    {otros.length > 0 && (
                      <p className="product-otros-comercios">
                        <button type="button" onClick={() => setModalOtrosComercios({ mejor: p, otros })}>
                          Otros comercios
                        </button>
                      </p>
                    )}
                    {esOtroComercio && (
                      <p className="product-otra-localidad">En otro comercio; el envío puede variar.</p>
                    )}
                    {recomendacionesAux.length > 0 && (
                      <div className="cliente-catalogo-auxiliar">
                        <span className="cliente-catalogo-auxiliar-label">Auxiliar de farmacia sugiere:</span>
                        <span className="cliente-catalogo-auxiliar-items">
                          {recomendacionesAux.join(' · ')}
                        </span>
                      </div>
                    )}
                  </div>
                  {isLoggedIn ? (
                    <div className="cliente-catalogo-actions">
                      <label className="cliente-catalogo-qty-label">Cantidad</label>
                      <div className="cliente-catalogo-qty">
                        <input
                          type="number"
                          min={1}
                          value={getCant(p.id)}
                          onChange={(e) => setCant(p.id, parseInt(e.target.value, 10) || 1)}
                          disabled={sinStockProducto}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={sinStockProducto}
                          onClick={async () => {
                            if (sinStockProducto) return
                            const cantidad = getCant(p.id)
                            const existencia = p.existencia ?? 0
                            if (existencia > 0 && cantidad > existencia) {
                              const ok = window.confirm(
                                `${MENSAJE_STOCK_OTRA_LOCALIDAD}\n\n¿Agregar ${cantidad} igualmente?`
                              )
                              if (!ok) return
                            }
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
                                  'Estás agregando productos de otro comercio. El delivery y tiempos pueden variar. ¿Deseas continuar?'
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
                  ) : (
                    <div className="cliente-catalogo-actions">
                      <p className="cliente-catalogo-login-hint">
                        Inicia sesión para ver disponibilidad y agregar al carrito.
                      </p>
                      <div className="cliente-catalogo-login-cta">
                        <a href="/login" className="login-cta-primary">Iniciar sesión</a>
                        <a href="/registro" className="login-cta-secondary">Crear cuenta</a>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      ))}

      {modalOtrosComercios && (
        <div
          className="cliente-catalogo-modal-backdrop"
          onClick={() => setModalOtrosComercios(null)}
          role="presentation"
        >
          <div className="cliente-catalogo-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Otros comercios · {modalOtrosComercios.mejor.descripcion}</h4>
            <ul>
              {modalOtrosComercios.otros.map((o) => (
                <li key={o.id}>
                  <span>Comercio {o.farmaciaId}</span>
                  <span>$ {(o.precioConPorcentaje ?? o.precio).toFixed(2)} · {o.existencia ?? 0} disp.</span>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOtrosComercios(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="cliente-catalogo-pagination">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading}>
            ← Anterior
          </button>
          <span className="cliente-catalogo-pagination-info">Página {page + 1} de {totalPages}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPage((p) => p + 1)} disabled={loading || page >= totalPages - 1}>
            Siguiente →
          </button>
        </div>
      )}
      <div className="cliente-catalogo-support">
        <p>
          ¿Tienes alguna duda con tu pedido o con el catálogo?{' '}
          <a href="/soporte">Escríbenos y te ayudamos</a>.
        </p>
      </div>
    </div>
  )
}
