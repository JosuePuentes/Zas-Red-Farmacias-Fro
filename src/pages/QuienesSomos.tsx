import './Home.css'

export default function QuienesSomos() {
  return (
    <div className="home">
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
      </div>
    </div>
  )
}

