import { Link } from 'react-router-dom'
import './Home.css'

function HomeBackIcon() {
  return (
    <svg className="home-back-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 11.5 12 5l7 6.5V19a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19v-7.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20V14h5v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function QuienesSomos() {
  return (
    <div className="home">
      <div className="home-content">
        <section className="home-hero">
          <Link to="/" className="home-back-icon" aria-label="Volver al inicio">
            <HomeBackIcon />
          </Link>
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

        <section className="home-section home-marcas">
          <h2 className="home-section-title">Marcas que nos respaldan</h2>
          <p className="home-section-subtitle">
            Trabajamos con laboratorios y distribuidores de confianza para ofrecerte productos de calidad.
          </p>
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
            </div>
          </div>
        </section>

        <section className="home-ctas">
          <Link to="/registro-farmacia" className="home-cta-card home-cta-farmacia">
            <span className="home-cta-icon">🏥</span>
            <h3>¿Tienes una farmacia?</h3>
            <p>Únete a nuestra red y llega a más clientes.</p>
            <span className="home-cta-link">Registrarse como farmacia →</span>
          </Link>
          <Link to="/registro-delivery" className="home-cta-card home-cta-delivery">
            <span className="home-cta-icon">🛵</span>
            <h3>¿Quieres ser repartidor?</h3>
            <p>Regístrate como delivery y genera ingresos con cada entrega.</p>
            <span className="home-cta-link">Registrarme como delivery →</span>
          </Link>
        </section>
      </div>
    </div>
  )
}

