import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// TODO: mostrar total compra + costo delivery (según dirección + GPS), método de pago (pago móvil, transferencia, zelle, binance), subir comprobante, procesar
export default function ClienteCheckout() {
  const [metodo, setMetodo] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const navigate = useNavigate()

  function handleProcesar() {
    if (!metodo || !comprobante) return
    // TODO: POST pedido con comprobante
    navigate('/cliente')
  }

  return (
    <div className="container">
      <h2>Completar compra</h2>
      <div className="card">
        <p><strong>Subtotal:</strong> $ 0,00</p>
        <p><strong>Costo delivery:</strong> $ 0,00 (según tu dirección y ubicación)</p>
        <p><strong>Total:</strong> $ 0,00</p>
      </div>
      <div className="card">
        <h3>Método de pago</h3>
        <label><input type="radio" name="metodo" value="pago_movil" onChange={(e) => setMetodo(e.target.value)} /> Pago móvil</label>
        <label><input type="radio" name="metodo" value="transferencia" onChange={(e) => setMetodo(e.target.value)} /> Transferencia bancaria</label>
        <label><input type="radio" name="metodo" value="zelle" onChange={(e) => setMetodo(e.target.value)} /> Zelle</label>
        <label><input type="radio" name="metodo" value="binance" onChange={(e) => setMetodo(e.target.value)} /> Binance</label>
      </div>
      <div className="card form-group">
        <label>Cargar comprobante</label>
        <input type="file" accept="image/*" onChange={(e) => setComprobante(e.target.files?.[0] ?? null)} />
      </div>
      <button type="button" className="btn btn-primary btn-block" onClick={handleProcesar} disabled={!metodo || !comprobante}>
        Procesar compra
      </button>
    </div>
  )
}
