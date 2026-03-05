import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './CartModal.css'

export default function CartModal() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, openCart, setOpenCart } = useCart()
  const navigate = useNavigate()

  function handleProcesar() {
    setOpenCart(false)
    navigate('/cliente/checkout')
  }

  if (!openCart) return null

  return (
    <>
      <div className="cart-modal-backdrop" onClick={() => setOpenCart(false)} aria-hidden="true" />
      <div className="cart-modal" role="dialog" aria-label="Carrito de compras">
        <div className="cart-modal-header">
          <h2>Tu carrito</h2>
          <button type="button" className="cart-modal-close" onClick={() => setOpenCart(false)} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="cart-modal-body">
          {items.length === 0 ? (
            <p className="cart-modal-empty">No hay productos en el carrito.</p>
          ) : (
            <ul className="cart-modal-list">
              {items.map((item) => {
                const precio = item.producto.precioConPorcentaje ?? item.producto.precio
                const subtotal = precio * item.cantidad
                return (
                  <li key={`${item.producto.id}-${item.farmaciaId}`} className="cart-modal-item">
                    <div className="cart-modal-item-info">
                      <span className="cart-modal-item-desc">{item.producto.descripcion}</span>
                      <span className="cart-modal-item-marca">{item.producto.marca}</span>
                      <span className="cart-modal-item-precio">$ {precio.toFixed(2)} × {item.cantidad} = $ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="cart-modal-item-actions">
                      <div className="cart-modal-qty">
                        <button type="button" onClick={() => updateQuantity(item.producto.id, item.farmaciaId, item.cantidad - 1)}>−</button>
                        <span>{item.cantidad}</span>
                        <button type="button" onClick={() => updateQuantity(item.producto.id, item.farmaciaId, item.cantidad + 1)}>+</button>
                      </div>
                      <button type="button" className="cart-modal-remove" onClick={() => removeItem(item.producto.id, item.farmaciaId)} title="Eliminar">
                        Eliminar
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="cart-modal-footer">
            <p className="cart-modal-total">
              <strong>Total ({totalItems} {totalItems === 1 ? 'producto' : 'productos'}):</strong> $ {totalPrice.toFixed(2)}
            </p>
            <button type="button" className="btn btn-primary cart-modal-btn" onClick={handleProcesar}>
              Procesar orden
            </button>
          </div>
        )}
      </div>
    </>
  )
}
