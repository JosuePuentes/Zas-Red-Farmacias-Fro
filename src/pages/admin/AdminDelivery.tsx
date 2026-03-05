// TODO: listar solicitudes de delivery pendientes, aprobar/denegar, al aprobar solicitar contraseña
export default function AdminDelivery() {
  return (
    <div className="container">
      <h2>Solicitudes de repartidores</h2>
      <p className="muted">Aquí llegan las solicitudes. Puedes aprobar o denegar. Al aprobar se te pedirá asignar una contraseña.</p>
      <div className="card">
        <p>Lista de solicitudes con: tipo vehículo, cédula, nombres, dirección, teléfono, correo, licencia, fotos.</p>
      </div>
    </div>
  )
}
