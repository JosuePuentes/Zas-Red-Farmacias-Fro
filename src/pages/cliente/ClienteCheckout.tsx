import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useGeolocation } from '../../context/GeolocationContext'
import MapPicker from '../../components/MapPicker'
import type { Coords } from '../../context/GeolocationContext'
import { carritoApi } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function ClienteCheckout() {
  const [step, setStep] = useState<'ubicacion' | 'pago'>('ubicacion')
  const [entregaCoords, setEntregaCoords] = useState<Coords | null>(null)
  const [direccionEntrega, setDireccionEntrega] = useState('')
  const [metodo, setMetodo] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const navigate = useNavigate()
  const { totalPrice, clearCart } = useCart()
  const { position, requestLocation, loading: gpsLoading, error: gpsError } = useGeolocation()
  const { user } = useAuth()
  const costoDelivery = 0 // TODO: backend según distancia

  useEffect(() => {
    if (position && !entregaCoords) setEntregaCoords(position)
  }, [position, entregaCoords])

  function handleConfirmarUbicacion() {
    if (entregaCoords) setStep('pago')
  }

  async function handleProcesar() {
    if (!metodo || !comprobante) return
    try {
      if (user) {
        await carritoApi.confirmar(user.id)
      }
      // TODO: enviar también datos de entrega y comprobante cuando el backend lo soporte
      clearCart()
      navigate('/cliente/mis-pedidos')
    } catch (e) {
      console.error('Error al confirmar pedido', e)
      // En esta primera versión mantenemos el carrito si falla
    }
  }

  return (
    <div className="container">
      <h2>Completar compra</h2>

      {step === 'ubicacion' && (
        <div className="card checkout-ubicacion">
          <h3>Ubicación de entrega</h3>
          <p>Activa el GPS para marcar en el mapa dónde debe entregarse tu pedido. El delivery usará esta ubicación.</p>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => requestLocation()} disabled={gpsLoading}>
            {gpsLoading ? 'Obteniendo ubicación…' : 'Activar GPS y usar mi ubicación actual'}
          </button>
          {gpsError && <p className="auth-error" style={{ marginTop: 8 }}>{gpsError}</p>}
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Dirección (opcional, para referencia)</label>
            <input
              value={direccionEntrega}
              onChange={(e) => setDireccionEntrega(e.target.value)}
              placeholder="Ej: Av. Principal, edificio X, apto 5"
            />
          </div>
          <div className="checkout-map-wrap">
            <p>Marca en el mapa el punto exacto de entrega (o confirma tu ubicación actual):</p>
            <MapPicker value={entregaCoords} onChange={setEntregaCoords} height="40vh" zoom={14} />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleConfirmarUbicacion}
            disabled={!entregaCoords}
          >
            Confirmar ubicación y continuar
          </button>
        </div>
      )}

      {step === 'pago' && (
        <>
          <div className="card">
            <p><strong>Entrega en:</strong> {direccionEntrega || 'Ubicación en mapa'}</p>
            {entregaCoords && <p className="muted">Coordenadas: {entregaCoords.lat.toFixed(5)}, {entregaCoords.lng.toFixed(5)}</p>}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep('ubicacion')}>
              Cambiar ubicación
            </button>
          </div>
          <div className="card">
            <p><strong>Subtotal:</strong> $ {totalPrice.toFixed(2)}</p>
            <p><strong>Costo delivery:</strong> $ {costoDelivery.toFixed(2)}</p>
            <p><strong>Total:</strong> $ {(totalPrice + costoDelivery).toFixed(2)}</p>
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
        </>
      )}
    </div>
  )
}
