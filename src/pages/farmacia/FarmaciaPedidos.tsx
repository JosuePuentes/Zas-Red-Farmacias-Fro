// TODO: pedidos con notificación y número, ver datos del cliente y lo solicitado, validar o denegar
export default function FarmaciaPedidos() {
  return (
    <div className="container">
      <h2>Pedidos</h2>
      <p className="badge badge-warning">Notificación: 0 pedidos nuevos</p>
      <div className="card">
        <p>Lista de pedidos con datos del cliente e ítems. Botones Validar / Denegar.</p>
      </div>
    </div>
  )
}
