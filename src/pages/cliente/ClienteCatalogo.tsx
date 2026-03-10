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

const MOCK_PRODUCTOS: Producto[] = [
  { id: '1', codigo: 'COD-001', descripcion: 'Paracetamol 500mg', principioActivo: 'Paracetamol', presentacion: 'Caja 20 tab', marca: 'La Sante', precio: 5.5, descuentoPorcentaje: 10, precioConPorcentaje: 4.95, farmaciaId: 'f1', existencia: 10 },
  { id: '2', codigo: 'COD-002', descripcion: 'Ibuprofeno 400mg', principioActivo: 'Ibuprofeno', presentacion: 'Caja 30 tab', marca: 'Cofasa', precio: 6.0, farmaciaId: 'f1', existencia: 30 },
  { id: '3', codigo: 'COD-003', descripcion: 'Vitamina C 1g', principioActivo: 'Ácido ascórbico', presentacion: 'Frasco 30 tab', marca: 'Genven', precio: 8.0, descuentoPorcentaje: 20, precioConPorcentaje: 6.4, farmaciaId: 'f2', existencia: 20 },
]

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

export default function ClienteCatalogo() {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [searchParams] = useSearchParams()
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

  const coords = position

  // Base para imágenes del backend: VITE_API_URL (sin /api) o window.location.origin
  const backendBase = useMemo(() => {
    const apiBase = getApiBaseUrl()
    return apiBase.replace(/\/api\/?$/, '')
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
          setProductos(itemsDesdeRespuestaCatalogo(res as Record<string, unknown>))
          setTotal(totalRes)
          setTotalPages(Math.max(1, totalPagesRes))
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e)
          setError('No se pudo cargar el catálogo, mostrando datos de prueba.')
          setProductos(MOCK_PRODUCTOS)
          setTotal(MOCK_PRODUCTOS.length)
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
  }, [searchParams])

  // La búsqueda se hace en el backend (parámetro q); no filtrar de nuevo en cliente para no ocultar resultados
  const grupos = useMemo(() => agruparPorMejorPrecio(productos), [productos])
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

  return (
    <div className="cliente-catalogo container">
      {/* Calculadora delivery (compacta) */}
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

      <div className="cliente-catalogo-location">
        <span className="cliente-catalogo-location-label">Ubicación</span>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todo el país</option>
          {ESTADOS_VENEZUELA.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>
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

      {loading && productos.length === 0 && <p className="cliente-catalogo-empty">Cargando catálogo...</p>}
      {error && <p className="cliente-catalogo-empty">{error}</p>}
      {!loading && productos.length === 0 && (
        <p className="cliente-catalogo-empty">
          {busqueda.trim() ? 'No hay resultados para tu búsqueda. Prueba con otro término.' : 'No hay productos en el catálogo. Prueba más tarde o contacta al administrador.'}
        </p>
      )}
      {!loading && productos.length > 0 && total > 0 && (
        <p className="cliente-catalogo-total" role="status">
          {total.toLocaleString()} resultado{total !== 1 ? 's' : ''} {totalPages > 1 ? `· Página ${page + 1} de ${totalPages}` : ''}
        </p>
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

              const imagenUrl =
                p.imagen && !p.imagen.startsWith('http')
                  ? `${backendBase}${p.imagen}`
                  : p.imagen

              return (
                <article
                  key={key}
                  className={`cliente-catalogo-card card ${esMismoComercio ? 'producto-mismo-comercio' : ''}`}
                >
                  <div className="product-photo">
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
                    {sinStockProducto && (
                      <>
                        <p className="product-sin-stock" role="status">Sin stock</p>
                        {user && (
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
                        )}
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
                  </div>
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
    </div>
  )
}
