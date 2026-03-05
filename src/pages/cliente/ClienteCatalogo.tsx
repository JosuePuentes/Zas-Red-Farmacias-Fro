import { useState } from 'react'
// TODO: filtro por estado (Venezuela), buscador, productos con foto izq + descripción + precio y agregar carrito
// Productos misma farmacia: clase product-same-store y mensaje "mismo comercio"
// Producto otra farmacia: clase product-other-store y aviso "no está en la misma farmacia, delivery más costoso"
export default function ClienteCatalogo() {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  return (
    <div className="container">
      <p className="badge badge-info" style={{ marginBottom: '0.75rem' }}>
        Los productos marcados con el mismo color están en el mismo comercio.
      </p>
      <div className="form-group">
        <input
          type="search"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="form-group">
        <label>Filtrar por estado</label>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="miranda">Miranda</option>
          <option value="caracas">Distrito Capital</option>
          <option value="zulia">Zulia</option>
          {/* TODO: estados desde backend */}
        </select>
      </div>
      <div className="product-list">
        <div className="card product-same-store product-row">
          <div className="product-photo">Foto</div>
          <div className="product-info">
            <span className="product-codigo">COD-001</span>
            <p className="product-desc">Descripción, principio activo, presentación, marca</p>
            <p className="product-precio">Precio: $ XX,XX <button className="btn btn-primary btn-sm">+ Carrito</button></p>
          </div>
        </div>
      </div>
    </div>
  )
}
