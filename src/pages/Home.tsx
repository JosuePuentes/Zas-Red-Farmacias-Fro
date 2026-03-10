import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGeolocation } from '../context/GeolocationContext'
import './Home.css'

const ESTADOS_VE = [
  'Amazonas',
  'Anzoátegui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Distrito Capital',
  'Falcón',
  'Guárico',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'La Guaira',
  'Yaracuy',
  'Zulia',
]

const SLIDES = [
  {
    id: 1,
    title: 'Farmacias de confianza',
    subtitle: 'Red nacional de farmacias y delivery',
    className: 'slide-farmacia',
    image: '/images/zas-farmacias.png',
  },
  {
    id: 2,
    title: 'Medicamentos a tu alcance',
    subtitle: 'Todo lo que necesitas en un solo lugar',
    className: 'slide-medicamentos',
    image: '/images/zas-app.png',
  },
  {
    id: 3,
    title: 'Delivery a domicilio',
    subtitle: 'Recibe tus pedidos donde estés',
    className: 'slide-delivery',
    image: '/images/zas-delivery.png',
  },
  {
    id: 4,
    title: 'Marcas y laboratorios',
    subtitle: 'Productos de calidad en Venezuela',
    className: 'slide-laboratorios',
    image: '/images/zas-labs.png',
  },
]

// Logos de laboratorios y marcas aliadas (cargar imágenes en /public/logos)
const MARCAS = [
  {
    id: 'grupo-leti',
    name: 'Grupo LETI',
    image: '/logos/grupo-leti.png',
    url: 'https://grupoleti.com/',
  },
  {
    id: 'genven',
    name: 'Genven · Grupo LETI',
    image: '/logos/genven.png',
    url: 'https://grupoleti.com/genven',
  },
  {
    id: 'biotech',
    name: 'Biotech',
    image: '/logos/biotech.png',
    url: 'https://www.biotech.com.ve/',
  },
  {
    id: 'cofasa',
    name: 'Cofasa',
    image: '/logos/cofasa.png',
    url: 'https://laboratoriocofasa.com/inicio/',
  },
  {
    id: 'la-sante',
    name: 'La Santé',
    image: '/logos/la-sante.png',
    url: 'https://www.pharmetiquelabs.com.ve/lasante/',
  },
]

export default function Home() {
  const [slideIndex, setSlideIndex] = useState(0)
  const [estadoEnvio, setEstadoEnvio] = useState<string>('Venezuela')
  const [mostrarEstados, setMostrarEstados] = useState(false)
  const { position, error, loading, permissionAsked, requestLocation, clearError, dismissLocationPrompt } = useGeolocation()
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-header-left">
            <Link to="/" className="home-header-brand" aria-label="Inicio Zas!">
              <img src="/logo.png" alt="Zas! - Red de farmacias" className="home-header-logo" />
              <span className="home-header-title">Zas! Farma</span>
            </Link>
          </div>

          <form
            className="home-header-search"
            onSubmit={(e) => {
              e.preventDefault()
              const q = terminoBusqueda.trim()
              if (!q) {
                navigate('/cliente?buscar=1')
                return
              }
              navigate(`/cliente?q=${encodeURIComponent(q)}`)
            }}
          >
            <div className="home-search-select">Todos</div>
            <input
              type="search"
              className="home-search-input"
              placeholder="Buscar medicamentos, marcas o productos de cuidado personal…"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
            <button type="submit" className="home-search-button" aria-label="Buscar">
              🔍
            </button>
          </form>

          <div className="home-header-right">
            <div className="home-header-location">
              <button
                type="button"
                className="home-location-button"
                onClick={() => setMostrarEstados((v) => !v)}
              >
                <span className="home-location-icon">📍</span>
                <span className="home-location-text">
                  <span className="home-location-label">Enviar a</span>
                  <span className="home-location-value">{estadoEnvio}</span>
                </span>
              </button>
              {mostrarEstados && (
                <div className="home-location-dropdown">
                  <p className="home-location-heading">Selecciona tu estado</p>
                  <ul>
                    {ESTADOS_VE.map((estado) => (
                      <li key={estado}>
                        <button
                          type="button"
                          onClick={() => {
                            setEstadoEnvio(estado)
                            setMostrarEstados(false)
                          }}
                        >
                          {estado}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="home-header-account">
              <span className="home-account-label">Hola, inicia sesión</span>
              <Link to="/login" className="home-account-link">
                Cuenta y listas
              </Link>
            </div>
            <Link to="/cliente" className="home-header-cart" aria-label="Ir al carrito / catálogo">
              <span className="home-cart-icon">🛒</span>
              <span className="home-cart-text">Carrito</span>
            </Link>
          </div>
        </div>

        <nav className="home-header-nav" aria-label="Categorías principales">
          <button type="button" className="home-nav-all">
            ☰&nbsp; Todo
          </button>
          <button type="button">Salud y medicamentos</button>
          <button type="button">Belleza</button>
          <button type="button">Cuidado personal</button>
          <button type="button">Bebé</button>
          <button type="button">Hogar y mascotas</button>
          <button type="button">Ofertas</button>
        </nav>
      </header>

      {!permissionAsked && (
        <div className="home-gps-banner">
          <p>Para una mejor experiencia (pedidos, delivery y ubicación de farmacias), activa tu ubicación.</p>
          <div className="home-gps-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                clearError()
                requestLocation()
              }}
              disabled={loading}
            >
              {loading ? 'Obteniendo…' : 'Activar ubicación'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={dismissLocationPrompt}>
              Más tarde
            </button>
          </div>
          {error && <p className="home-gps-error">{error}</p>}
          {position && <p className="home-gps-ok">Ubicación activada.</p>}
        </div>
      )}

      <aside className="home-banner">
        <div className="home-banner-inner">
          <div className="home-banner-text">
            <span className="home-banner-label">Farmacia online · Delivery</span>
            <p>Todo para tu salud, cuidado personal y familia en un solo lugar · Venezuela</p>
          </div>
          <div className="home-banner-actions">
            <Link to="/login" className="btn btn-primary btn-banner">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="btn btn-secondary btn-banner">
              Crear cuenta
            </Link>
          </div>
        </div>
      </aside>

      <div className="home-content">
        <section className="home-hero">
          <div className="home-hero-main">
            <img src="/logo.png" alt="Zas! - Red de farmacias" className="home-logo-img" />
            <div className="home-hero-text">
              <h1 className="home-logo">Zas! Farma</h1>
              <p className="home-tagline">
                Tu farmacia online con red de farmacias aliadas y delivery en toda Venezuela.
              </p>
              <p className="home-tagline-accent">
                En <strong>Zas!</strong> encuentras medicamentos, cuidado personal y mucho más, sin ruletear de farmacia en farmacia.
              </p>
            </div>
          </div>
        </section>

        <section className="home-carousel-wrap">
          <div
            className="home-carousel"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {SLIDES.map((slide) => (
              <div
                key={slide.id}
                className={`home-slide ${slide.className}`}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="home-slide-overlay" />
                <div className="home-slide-text">
                  <h2>{slide.title}</h2>
                  <p>{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="home-carousel-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`home-dot ${i === slideIndex ? 'active' : ''}`}
                onClick={() => setSlideIndex(i)}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="home-section home-marcas">
          <h2 className="home-section-title">Marcas que nos respaldan</h2>
          <p className="home-section-subtitle">
            Trabajamos con laboratorios y distribuidores de confianza para ofrecerte productos de calidad.
          </p>
          <div className="home-marcas-grid">
            {MARCAS.map((marca) => (
              <a
                key={marca.id}
                className="home-marca-card"
                href={marca.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div
                  className="home-marca-img"
                  style={{ backgroundImage: `url(${marca.image})` }}
                />
                <span className="home-marca-name">{marca.name}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="home-section home-delivery">
          <div className="home-split">
            <div className="home-split-media">
              <img
                src="/images/zas-delivery.png"
                alt="Delivery de medicamentos Zas!"
              />
            </div>
            <div className="home-split-content">
              <h2 className="home-section-title">Delivery a domicilio</h2>
              <p>
                Recibe tus medicamentos y productos de farmacia donde estés. Nuestra red de repartidores
                te lleva todo con rapidez y cuidado. Pedidos validados por tu farmacia de confianza.
              </p>
              <Link to="/registro-delivery" className="btn btn-primary">
                Quiero ser repartidor
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section home-medicamentos">
          <div className="home-split home-split-reverse">
            <div className="home-split-media">
              <img
                src="/images/zas-medicamentos.png"
                alt="Pasillo de farmacia Zas! — Red Nacional y Delivery"
              />
            </div>
            <div className="home-split-content">
              <h2 className="home-section-title">Medicamentos y más</h2>
              <p>
                <strong>Tu salud, a un solo toque de distancia.</strong> Explora nuestro extenso catálogo de medicamentos,
                vitaminas y productos de cuidado personal, diseñado para ofrecerte bienestar integral desde la palma de tu mano.
              </p>
              <p>
                <strong>Geolocalización Inteligente:</strong> Encuentra tus medicamentos en la red de farmacias más cercana a tu ubicación
                de manera inmediata.
              </p>
              <p>
                <strong>Gestión Ágil:</strong> Selecciona tus productos, añádelos al carrito y gestiona tu pedido con total simplicidad.
              </p>
              <p>
                <strong>Servicio de Delivery Especializado:</strong> Recibe tus requerimientos directamente en tu puerta con nuestro sistema
                de entrega a domicilio, garantizando rapidez y seguridad en cada envío.
              </p>
              <Link to="/login" className="btn btn-primary">
                Ver catálogo
              </Link>
            </div>
          </div>
        </section>

        <section className="home-ctas">
          <Link to="/registro-farmacia" className="home-cta-card home-cta-farmacia">
            <span className="home-cta-icon">🏥</span>
            <h3>¿Tienes una farmacia?</h3>
            <p>Únete a nuestra red y llega a más clientes. Registrarse como farmacia.</p>
            <span className="home-cta-link">Registrarse como farmacia →</span>
          </Link>
          <Link to="/registro-delivery" className="home-cta-card home-cta-delivery">
            <span className="home-cta-icon">🛵</span>
            <h3>¿Quieres ser repartidor?</h3>
            <p>Regístrate como delivery y genera ingresos con cada entrega.</p>
            <span className="home-cta-link">Registrarme como delivery →</span>
          </Link>
        </section>

        <footer className="home-footer">
          <p>Comercio de medicamentos farmacéuticos · Venezuela</p>
          <p className="home-footer-legal">Zas! — Red de farmacias y delivery</p>
        </footer>
      </div>
    </div>
  )
}
