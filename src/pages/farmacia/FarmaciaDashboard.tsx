// TODO: total productos vendidos, total $ vendidos, total clientes
export default function FarmaciaDashboard() {
  return (
    <div className="container">
      <h2>Dashboard</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total productos vendidos</h3>
          <p className="big-number">0</p>
        </div>
        <div className="card">
          <h3>Total $ vendidos</h3>
          <p className="big-number">$ 0,00</p>
        </div>
        <div className="card">
          <h3>Total clientes</h3>
          <p className="big-number">0</p>
        </div>
      </div>
    </div>
  )
}
