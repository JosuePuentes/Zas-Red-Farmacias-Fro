import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ESTADOS_VENEZUELA } from '../../constants/estados'
import ClienteCatalogo from './ClienteCatalogo'
import { CartProvider, useCart } from '../../context/CartContext'
import './CatalogoPublico.css'

function CatalogoPublicoInner() {
  const { isAuthenticated } = useAuth()
  const { totalItems } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(() => searchParams.get('q') ?? '')
  const [estadoEnvio, setEstadoEnvio] = useState('Zulia')
  const [showEstados, setShowEstados] = useState(false)

  function handleBuscarSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = q.trim()
    const next: Record<string, string> = {}
    if (value) next.q = value
    setSearchParams(next)
  }

  function handleNavFilter(nextQ: string) {
    setQ(nextQ)
    const params: Record<string, string> = {}
    if (nextQ.trim()) params.q = nextQ.trim()
    setSearchParams(params)
  }

  return (
    <div className="catalogo-publico">
      <header className="catalogo-publico-header">
        <div className="catalogo-publico-header-top">
          <div className="catalogo-publico-logo-zone">
            <div className="catalogo-publico-logo">
              <img src="/logo.png" alt="Zas!" />
              <span>Zas! Farma</span>
            </div>
            <button
              type="button"
              className="catalogo-publico-envio"
              onClick={() => setShowEstados((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={showEstados}
            >
              <span className="catalogo-publico-envio-pin">📍</span>
              <span className="catalogo-publico-envio-text">
                <span className="catalogo-publico-envio-label">Enviar a</span>
                <span className="catalogo-publico-envio-estado">{estadoEnvio}</span>
              </span>
            </button>
          </div>
          <form
            className="catalogo-publico-toolbar-search catalogo-publico-toolbar-search--full"
            onSubmit={handleBuscarSubmit}
          >
            <input
              type="search"
              placeholder="Busca aquí tu producto"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar productos"
            />
            <button type="submit" aria-label="Buscar">🔍</button>
          </form>
          <div className="catalogo-publico-user">
            <Link to="/cliente" className="catalogo-publico-cart-btn" aria-label="Ver carrito">
              <span className="catalogo-publico-cart-icon">🛒</span>
              {totalItems > 0 && (
                <span className="catalogo-publico-cart-badge">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            {!isAuthenticated ? (
              <Link to="/login" className="catalogo-publico-user-btn">
                <span className="catalogo-publico-user-icon">👤</span>
                <span>Entrar</span>
              </Link>
            ) : (
              <Link to="/cliente" className="catalogo-publico-user-btn">
                <span className="catalogo-publico-user-icon">👤</span>
                <span>Mi cuenta</span>
              </Link>
            )}
          </div>
        </div>
        <div className="catalogo-publico-header-bottom">
            <nav className="catalogo-publico-subnav" aria-label="Categorías principales">
              <button
                type="button"
                onClick={() => handleNavFilter('')}
                className="catalogo-publico-subnav-item"
              >
                Todo
              </button>
              <button
                type="button"
                onClick={() => handleNavFilter('medicamentos')}
                className="catalogo-publico-subnav-item"
              >
                Salud y medicamentos
              </button>
              <button
                type="button"
                onClick={() => handleNavFilter('cuidado personal')}
                className="catalogo-publico-subnav-item"
              >
                Cuidado personal
              </button>
              <button
                type="button"
                onClick={() => handleNavFilter('bebe')}
                className="catalogo-publico-subnav-item"
              >
                Bebé
              </button>
              <button
                type="button"
                onClick={() => handleNavFilter('oferta descuento promo')}
                className="catalogo-publico-subnav-item"
              >
                Ofertas
              </button>
            </nav>
          <nav className="catalogo-publico-links">
            <Link to="/quienes-somos" className="catalogo-publico-link-sm">
              ¿Quiénes somos?
            </Link>
            <Link to="/soporte" className="catalogo-publico-link-sm">
              Contacto
            </Link>
          </nav>
        </div>
        {showEstados && (
          <div className="catalogo-publico-envio-dropdown" role="listbox" aria-label="Seleccionar estado">
            {ESTADOS_VENEZUELA.map((estado) => (
              <button
                key={estado}
                type="button"
                className={`catalogo-publico-envio-option ${estado === estadoEnvio ? 'is-active' : ''}`}
                onClick={() => {
                  setEstadoEnvio(estado)
                  setShowEstados(false)
                }}
              >
                {estado}
              </button>
            ))}
          </div>
        )}
      </header>
      <main className="catalogo-publico-main">
        <ClienteCatalogo
          showDeliveryBox={false}
          showInlineFilters={false}
          showLocationSelect={false}
        />
      </main>
    </div>
  )
}

export default function CatalogoPublico() {
  return (
    <CartProvider>
      <CatalogoPublicoInner />
    </CartProvider>
  )
}

