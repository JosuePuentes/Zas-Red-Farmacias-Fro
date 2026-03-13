export default function ClienteSoporte() {
  return (
    <div className="container">
      <h2>Soporte</h2>
      <div className="card">
        <p><strong>¿Necesitas ayuda?</strong></p>
        <p>Escríbenos a soporte@zas.com o contáctanos por WhatsApp.</p>
        <a
          href="https://wa.me/584146772709"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ marginTop: '0.75rem' }}
        >
          Abrir WhatsApp: +58 414 677 2709
        </a>
        <p className="muted">Horario de atención: Lunes a Viernes, 8:00 - 18:00</p>
      </div>
    </div>
  )
}
