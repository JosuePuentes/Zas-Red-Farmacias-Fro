// TODO: control dinero ganado por pedidos, total, km recorridos
export default function DeliveryEstadisticas() {
  return (
    <div className="container">
      <h2>Mis ganancias</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total ganado</h3>
          <p className="big-number">$ 0,00</p>
        </div>
        <div className="card">
          <h3>Pedidos realizados</h3>
          <p className="big-number">0</p>
        </div>
        <div className="card">
          <h3>Km recorridos</h3>
          <p className="big-number">0</p>
        </div>
      </div>
    </div>
  )
}
