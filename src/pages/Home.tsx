import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const SLIDES = [
  {
    id: 1,
    title: 'Farmacias de confianza',
    subtitle: 'Red de farmacias en todo el país',
    className: 'slide-farmacia',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
  },
  {
    id: 2,
    title: 'Medicamentos a tu alcance',
    subtitle: 'Todo lo que necesitas en un solo lugar',
    className: 'slide-medicamentos',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
  },
  {
    id: 3,
    title: 'Marcas y laboratorios',
    subtitle: 'Productos de calidad en Venezuela',
    className: 'slide-laboratorios',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
  },
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
      {/* Franja superior para publicidad */}
      <aside className="home-banner">
        <div className="home-banner-inner">
          <span className="home-banner-label">Publicidad</span>
          <p>Espacio para tu anuncio · Contáctanos</p>
        </div>
      </aside>

      <div className="home-content">
        {/* Logo y mensaje principal */}
        <header className="home-hero">
          <h1 className="home-logo">Zas!</h1>
          <p className="home-tagline">
            Deja de estar buscando o ruleteando de farmacia en farmacia para conseguir tus medicamentos.
          </p>
          <p className="home-tagline-accent">
            En <strong>Zas!</strong> consigues todo a la mano.
          </p>
        </header>

        {/* Carrusel de imágenes */}
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

        {/* Acciones principales */}
        <section className="home-actions">
          <Link to="/login" className="btn btn-primary btn-home">
            Iniciar sesión
          </Link>
          <Link to="/registro" className="btn btn-secondary btn-home">
            Crear cuenta
          </Link>
        </section>

        {/* ¿Tienes farmacia? ¿Quieres ser delivery? */}
        <section className="home-ctas">
          <Link to="/login" className="home-cta-card home-cta-farmacia">
            <span className="home-cta-icon">🏥</span>
            <h3>¿Tienes una farmacia?</h3>
            <p>Únete a nuestra red y llega a más clientes. Forma parte de Zas!</p>
            <span className="home-cta-link">Más información →</span>
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
        </footer>
      </div>
    </div>
  )
}
