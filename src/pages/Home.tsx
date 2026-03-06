import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

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
  { id: 'grupo-leti', name: 'Grupo LETI', image: '/logos/grupo-leti.png' },
  { id: 'genven', name: 'Genven · Grupo LETI', image: '/logos/genven.png' },
  { id: 'biotech', name: 'Biotech', image: '/logos/biotech.png' },
  { id: 'cofasa', name: 'Cofasa', image: '/logos/cofasa.png' },
  { id: 'la-sante', name: 'La Santé', image: '/logos/la-sante.png' },
]

export default function Home() {
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="home">
      <aside className="home-banner">
        <div className="home-banner-inner">
          <div className="home-banner-text">
            <span className="home-banner-label">Red de farmacias</span>
            <p>Medicamentos, cuidado personal y delivery a domicilio · Venezuela</p>
          </div>
          <div className="home-banner-actions">
            <Link to="/login" className="btn btn-primary btn-banner">Iniciar sesión</Link>
            <Link to="/registro" className="btn btn-secondary btn-banner">Crear cuenta</Link>
          </div>
        </div>
      </aside>

      <div className="home-content">
        <header className="home-hero">
          <img src="/logo.png" alt="Zas! - Red de farmacias" className="home-logo-img" />
          <h1 className="home-logo">Zas!</h1>
          <p className="home-tagline">
            Deja de estar buscando o ruleteando de farmacia en farmacia para conseguir tus medicamentos.
          </p>
          <p className="home-tagline-accent">
            En <strong>Zas!</strong> consigues todo a la mano.
          </p>
        </header>

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

        {/* Marcas con las que trabajamos */}
        <section className="home-section home-marcas">
          <h2 className="home-section-title">Marcas que nos respaldan</h2>
          <p className="home-section-subtitle">
            Trabajamos con laboratorios y distribuidores de confianza para ofrecerte productos de calidad.
          </p>
          <div className="home-marcas-grid">
            {MARCAS.map((marca) => (
              <div key={marca.id} className="home-marca-card">
                <div
                  className="home-marca-img"
                  style={{ backgroundImage: `url(${marca.image})` }}
                />
                <span className="home-marca-name">{marca.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery con foto */}
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

        {/* Medicamentos y productos con foto */}
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

        {/* CTAs: farmacia y delivery */}
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
