import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ClienteCatalogo from './ClienteCatalogo'
import { CartProvider } from '../../context/CartContext'
import './CatalogoPublico.css'

export default function CatalogoPublico() {
  const { isAuthenticated } = useAuth()

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
          <ClienteCatalogo />
        </main>
      </div>
    </CartProvider>
  )
}

