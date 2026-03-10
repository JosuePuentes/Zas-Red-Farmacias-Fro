import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ClienteCatalogo from './ClienteCatalogo'
import { CartProvider } from '../../context/CartContext'
import './CatalogoPublico.css'

export default function CatalogoPublico() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(() => searchParams.get('q') ?? '')

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
          <ClienteCatalogo showDeliveryBox={false} />
        </main>
      </div>
    </CartProvider>
  )
}

