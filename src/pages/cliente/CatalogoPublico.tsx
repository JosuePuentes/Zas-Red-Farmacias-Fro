import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ESTADOS_VENEZUELA } from '../../constants/estados'
import ClienteCatalogo from './ClienteCatalogo'
import { CartProvider } from '../../context/CartContext'
import './CatalogoPublico.css'

export default function CatalogoPublico() {
  const { isAuthenticated } = useAuth()
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
    <CartProvider>
      <div className="catalogo-publico">
        <header className="catalogo-publico-header">
          <div className="catalogo-publico-header-top">
            <div className="catalogo-publico-logo">
              <img src="/logo.png" alt="Zas!" />
              <span>Zas!</span>
            </div>
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
          </div>
          <div className="catalogo-publico-header-bottom">
            <button
              type="button"
              className="catalogo-publico-envio"
              onClick={() => setShowEstados((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={showEstados}
            >
              <span className="catalogo-publico-envio-label">Enviar a</span>
              <span className="catalogo-publico-envio-estado">{estadoEnvio}</span>
            </button>
            <nav className="catalogo-publico-subnav">
              <button type="button" onClick={() => handleNavFilter('')} className="catalogo-publico-subnav-item">
                Ordenar
              </button>
              <button type="button" onClick={() => handleNavFilter('categoria')} className="catalogo-publico-subnav-item">
                Categoría
              </button>
              <button type="button" onClick={() => handleNavFilter('marca')} className="catalogo-publico-subnav-item">
                Marca
              </button>
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
            showQuickSearch={false}
          />
        </main>
      </div>
    </CartProvider>
  )
}

