import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api'
import { ESTADOS_VENEZUELA } from '../../constants/estados'
import ClienteCatalogo from './ClienteCatalogo'
import { CartProvider, useCart } from '../../context/CartContext'
import './CatalogoPublico.css'

function CatalogoCartIcon() {
  return (
    <svg className="catalogo-publico-cart-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 5h2.4l1.4 9.5h10.1l1.6-7.5H7.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="19.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M9 9.2h7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CatalogoPublicoInner() {
  const { isAuthenticated, setAuth } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(() => searchParams.get('q') ?? '')
  const [estadoEnvio, setEstadoEnvio] = useState('Zulia')
  const [showEstados, setShowEstados] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  function handleBuscarSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  function handleNavFilter(nextQ: string) {
    setQ(nextQ)
  }

  useEffect(() => {
    const value = q.trim()
    const next: Record<string, string> = {}
    if (value) next.q = value
    setSearchParams(next)
  }, [q, setSearchParams])

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const { ok, status, data } = await authApi.loginWithStatus(loginEmail, loginPassword)
      if (status === 403) {
        const code = (data as { code?: string }).code
        if (code === 'SOLICITUD_FARMACIA_PENDIENTE' || code === 'SOLICITUD_DELIVERY_PENDIENTE') {
          setLoginError((data as { error?: string }).error || 'Tu solicitud está siendo verificada.')
          return
        }
      }
      if (ok && (data as { token?: string; user?: unknown }).token && (data as { user?: unknown }).user) {
        const d = data as { token: string; user: { role?: string; email?: string; id?: string; nombre?: string; apellido?: string } }
        setAuth(d.token, {
          id: d.user.id || '',
          email: d.user.email || loginEmail,
          role: (d.user.role as 'admin' | 'cliente' | 'farmacia' | 'delivery') || 'cliente',
          nombre: d.user.nombre,
          apellido: d.user.apellido,
        })
        setShowLoginModal(false)
        setLoginEmail('')
        setLoginPassword('')
        const role = (d.user.role || '').toString().toLowerCase()
        const emailNorm = (d.user.email || loginEmail || '').toString().toLowerCase().trim()
        const esMaster = role === 'master' || role === 'admin' || emailNorm === 'admin@zas.com'
        if (esMaster) navigate('/elegir-portal', { replace: true })
        else if (role === 'farmacia') navigate('/farmacia', { replace: true })
        else if (role === 'delivery') navigate('/delivery', { replace: true })
        else navigate('/cliente', { replace: true })
        return
      }
      setLoginError((data as { error?: string; message?: string }).error || (data as { message?: string }).message || 'Error al iniciar sesión')
    } catch {
      setLoginError('Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="catalogo-publico">
      <header className="catalogo-publico-header">
        <div className="catalogo-publico-header-top">
          <div className="catalogo-publico-logo-zone">
            <Link to="/" className="catalogo-publico-logo" aria-label="Ir al inicio Zas! Farma">
              <img src="/logo.png" alt="Zas!" />
              <span>Zas! Farma</span>
            </Link>
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
              <span className="catalogo-publico-cart-icon">
                <CatalogoCartIcon />
              </span>
              {totalItems > 0 && (
                <span className="catalogo-publico-cart-badge">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            {!isAuthenticated ? (
              <button
                type="button"
                className="catalogo-publico-user-btn"
                onClick={() => setShowLoginModal(true)}
                aria-label="Entrar"
              >
                <span className="catalogo-publico-user-icon">👤</span>
              </button>
            ) : (
              <Link
                to="/cliente"
                className="catalogo-publico-user-btn"
                aria-label="Ir a mi cuenta y ver módulos"
              >
                <span className="catalogo-publico-user-icon">👤</span>
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

      {showLoginModal && (
        <>
          <div className="catalogo-publico-modal-backdrop" onClick={() => setShowLoginModal(false)} aria-hidden="true" />
          <div className="catalogo-publico-login-modal" role="dialog" aria-labelledby="login-modal-title">
            <div className="catalogo-publico-login-modal-inner">
              <h2 id="login-modal-title">Iniciar sesión</h2>
              <form onSubmit={handleLoginSubmit}>
                {loginError && <div className="auth-error">{loginError}</div>}
                <div className="form-group">
                  <label htmlFor="login-modal-email">Correo</label>
                  <input
                    id="login-modal-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="login-modal-password">Contraseña</label>
                  <input
                    id="login-modal-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loginLoading}>
                  {loginLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              <p className="catalogo-publico-login-modal-registro">
                ¿No tienes cuenta? <Link to="/registro" onClick={() => setShowLoginModal(false)}>Crear cuenta</Link>
              </p>
              <Link to="/recuperar" className="auth-back" onClick={() => setShowLoginModal(false)}>
                ¿Olvidaste tu contraseña?
              </Link>
              <button type="button" className="catalogo-publico-login-modal-close" onClick={() => setShowLoginModal(false)} aria-label="Cerrar">
                ×
              </button>
            </div>
          </div>
        </>
      )}

      <main className="catalogo-publico-main">
        <ClienteCatalogo
          showDeliveryBox={false}
          showInlineFilters={false}
          showLocationSelect={false}
          showHero={!isAuthenticated}
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

