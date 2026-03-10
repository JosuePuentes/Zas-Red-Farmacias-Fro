import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useGeolocation } from '../../context/GeolocationContext'
import { clienteApi } from '../../api'
import ClienteCatalogo from './ClienteCatalogo'
import { CartProvider } from '../../context/CartContext'
import './CatalogoPublico.css'

const PUBLICIDAD_MENSAJES = [
  '💊 Promoción del mes: descuentos especiales en medicamentos de alto costo.',
  '🚚 Delivery rápido: recibe tu pedido en menos de 30 minutos en zonas seleccionadas.',
  '❤️ Zas! conecta farmacias de confianza cerca de ti.',
  '📲 Descarga próximamente nuestra app móvil para una experiencia aún más rápida.',
]

export default function CatalogoPublico() {
  const { isAuthenticated } = useAuth()
  const { position, loading: gpsLoading, error: gpsError, requestLocation } = useGeolocation()
  const [costoDelivery, setCostoDelivery] = useState<number | null>(null)
  const [loadingCosto, setLoadingCosto] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(() => searchParams.get('q') ?? '')

  useEffect(() => {
    if (!position) return
    let cancelled = false
    setLoadingCosto(true)
    clienteApi.estimacionDelivery(position.lat, position.lng)
      .then((res) => {
        if (!cancelled) setCostoDelivery(res.costo ?? null)
      })
      .catch(() => {
        if (!cancelled) setCostoDelivery(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingCosto(false)
      })
    return () => { cancelled = true }
  }, [position?.lat, position?.lng])

  async function handleCalcularDelivery() {
    const loc = await requestLocation()
    if (!loc) return
    setLoadingCosto(true)
    try {
      await clienteApi.guardarUbicacion(loc.lat, loc.lng)
      const res = await clienteApi.estimacionDelivery(loc.lat, loc.lng)
      setCostoDelivery(res.costo ?? null)
    } catch {
      setCostoDelivery(null)
    } finally {
      setLoadingCosto(false)
    }
  }

  const ubicacionLabel = position ? 'Ubicación activa' : 'Sin ubicación'
  const friendlyGpsError = gpsError ? 'No pudimos usar tu ubicación. Revisa permisos de GPS en tu navegador.' : null

  function handleBuscarSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = q.trim()
    const next: Record<string, string> = {}
    if (value) next.q = value
    setSearchParams(next)
  }

  return (
    <CartProvider>
      <div className="catalogo-publico">
        <header className="catalogo-publico-header">
          <div className="catalogo-publico-logo">
            <img src="/logo.png" alt="Zas!" />
            <span>Zas!</span>
          </div>
          <nav className="catalogo-publico-nav">
            <Link to="/" className="catalogo-publico-link catalogo-publico-link-active">
              Catálogo
            </Link>
            <Link to="/quienes-somos" className="catalogo-publico-link">
              ¿Quiénes somos?
            </Link>
            <Link to="/soporte" className="catalogo-publico-link">
              Contacto
            </Link>
          </nav>
          {/* Bloque de delivery ocultado en público; se usará cuando el backend y UX lo definan mejor */}
          <div className="catalogo-publico-user">
            {!isAuthenticated ? (
              <Link to="/login" className="catalogo-publico-user-btn">
                <span className="catalogo-publico-user-icon">👤</span>
                <span>Entrar / Crear cuenta</span>
              </Link>
            ) : (
              <Link to="/cliente" className="catalogo-publico-user-btn">
                <span className="catalogo-publico-user-icon">👤</span>
                <span>Mi cuenta</span>
              </Link>
            )}
          </div>
        </header>
        <main className="catalogo-publico-main">
          <form className="catalogo-publico-toolbar-search catalogo-publico-toolbar-search--full" onSubmit={handleBuscarSubmit}>
            <input
              type="search"
              placeholder="Busca aquí tu producto"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar productos"
            />
            <button type="submit" aria-label="Buscar">🔍</button>
          </form>
          {friendlyGpsError && (
            <p className="catalogo-publico-gps-error">
              {friendlyGpsError}
            </p>
          )}
          <ClienteCatalogo showDeliveryBox={false} />
        </main>
      </div>
    </CartProvider>
  )
}

