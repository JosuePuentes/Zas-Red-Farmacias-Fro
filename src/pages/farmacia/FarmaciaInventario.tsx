import { useState } from 'react'
// TODO: cargar inventario por Excel: codigo, descripcion, marca, precio, existencia
export default function FarmaciaInventario() {
  const [file, setFile] = useState<File | null>(null)
  return (
    <div className="container">
      <h2>Inventario</h2>
      <p className="muted">Carga tu inventario por Excel. Columnas: codigo, descripcion, marca, precio, existencia</p>
      <div className="card form-group">
        <label>Archivo Excel</label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="button" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={!file}>
          Subir inventario
        </button>
      </div>
    </div>
  )
}
