import { useCart } from '../../context/CartContext'

export default function ClienteCarrito() {
  const { setOpenCart } = useCart()

  return (
    <div className="container">
      <h2>Tu carrito</h2>
      <div className="card">
        <p>Usa el botón del carrito (abajo a la derecha) para ver tus productos, cambiar cantidades y procesar tu orden.</p>
        <button type="button" className="btn btn-primary" onClick={() => setOpenCart(true)}>
          Abrir carrito
        </button>
      </div>
    </div>
  )
}
