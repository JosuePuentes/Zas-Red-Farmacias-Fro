import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CartProvider } from '../../context/CartContext'
import ClienteCatalogo from './ClienteCatalogo'
import '../../layouts/ClienteLayout.css'
import '../../layouts/Layout.css'

export default function CatalogoPublico() {
  const { isAuthenticated } = useAuth()

  return (
    <CartProvider>
      <div className="layout cliente-layout">
        <header className="layout-header cliente-layout-header">
          <div className="cliente-header-center" style={{ justifyContent: 'flex-start' }}>
            <img src="/logo.png" alt="Zas!" className="cliente-header-logo" />
            <span className="cliente-header-title">Zas!</span>
          </div>
          <nav className="cliente-public-nav">
            <Link to="/" className="cliente-public-link cliente-public-link-active">
              Catálogo
            </Link>
            <Link to="/quienes-somos" className="cliente-public-link">
              ¿Quiénes somos?
            </Link>
            <Link to="/soporte" className="cliente-public-link">
              Contacto
            </Link>
          </nav>
          <div className="cliente-public-user">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="cliente-public-user-btn">
                  <span className="cliente-public-user-icon">👤</span>
                  <span>Entrar</span>
                </Link>
                <Link to="/registro" className="cliente-public-user-link">
                  Crear cuenta
                </Link>
              </>
            ) : (
              <Link to="/cliente" className="cliente-public-user-btn">
                <span className="cliente-public-user-icon">👤</span>
                <span>Mi cuenta</span>
              </Link>
            )}
          </div>
        </header>
        <main className="layout-main cliente-layout-main">
          <ClienteCatalogo />
        </main>
      </div>
    </CartProvider>
  )
}

