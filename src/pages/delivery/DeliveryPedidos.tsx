import { useState } from 'react'
// TODO: solo pedidos validados, dirección recoger/entregar, precio delivery, barra 1 min para aceptar, botón "Activar" para recibir pedidos
export default function DeliveryPedidos() {
  const [activo, setActivo] = useState(false)
  return (
    <div className="container">
      <h2>Pedidos</h2>
      {!activo ? (
        <div className="card">
          <p>Activa tu disponibilidad para recibir pedidos.</p>
          <button type="button" className="btn btn-primary" onClick={() => setActivo(true)}>
            Activar
          </button>
        </div>
      ) : (
        <>
          <p className="badge badge-success">Activo — Recibiendo pedidos</p>
          <div className="card">
            <p>Dirección recoger / Dirección entregar. Precio delivery. Tiempo 1 min para aceptar.</p>
          </div>
        </>
      )}
    </div>
  )
}
