import { Link } from 'react-router-dom'
// TODO: listar ítems del carrito, total, botón "Procesar compra" -> checkout
export default function ClienteCarrito() {
  return (
    <div className="container">
      <h2>Tu carrito</h2>
      <div className="card">
        <p>Ítems del carrito. Total. Botón "Procesar compra".</p>
        <Link to="/cliente/checkout" className="btn btn-primary">Procesar compra</Link>
      </div>
    </div>
  )
}
