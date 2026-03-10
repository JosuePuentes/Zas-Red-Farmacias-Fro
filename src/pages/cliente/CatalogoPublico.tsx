import { Link } from 'react-router-dom'
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
          <div className="catalogo-publico-delivery">
            <span className="catalogo-publico-delivery-label">Delivery:</span>
            <span className="catalogo-publico-delivery-monto">
              {loadingCosto || gpsLoading ? '…' : costoDelivery != null ? `$ ${costoDelivery.toFixed(2)}` : '—'}
            </span>
            <button
              type="button"
              className="catalogo-publico-delivery-btn"
              onClick={handleCalcularDelivery}
              disabled={loadingCosto || gpsLoading}
            >
              {position ? 'Actualizar' : 'Calcular'}
            </button>
          </div>
          <div className="catalogo-publico-user">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="catalogo-publico-user-btn">
                  <span className="catalogo-publico-user-icon">👤</span>
                  <span>Entrar</span>
                </Link>
                <Link to="/registro" className="catalogo-publico-user-link">
                  Crear cuenta
                </Link>
              </>
            ) : (
              <Link to="/cliente" className="catalogo-publico-user-btn">
                <span className="catalogo-publico-user-icon">👤</span>
                <span>Mi cuenta</span>
              </Link>
            )}
          </div>
        </header>
        <main className="catalogo-publico-main">
          <div className="catalogo-publico-marquee" aria-label="Anuncios">
            <div className="catalogo-publico-marquee-inner">
              {PUBLICIDAD_MENSAJES.map((m, i) => (
                <span key={i} className="catalogo-publico-marquee-item">
                  {m}
                </span>
              ))}
            </div>
          </div>
          {gpsError && (
            <p className="catalogo-publico-gps-error">
              {gpsError}
            </p>
          )}
          <ClienteCatalogo showDeliveryBox={false} />
        </main>
      </div>
    </CartProvider>
  )
}

