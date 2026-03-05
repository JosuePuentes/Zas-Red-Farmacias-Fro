import { useEffect, useState } from 'react'
import type { Producto } from '../../types'
import { farmaciaApi } from '../../api'

// Mock temporal hasta conectar con backend
const MOCK_INVENTARIO: Producto[] = [
  {
    id: '1',
    codigo: 'COD-001',
    descripcion: 'Paracetamol 500mg',
    principioActivo: 'Paracetamol',
    presentacion: 'Caja 20 tab',
    marca: 'La Sante',
    precio: 5.5,
    descuentoPorcentaje: 10,
    precioConPorcentaje: 4.95,
    existencia: 50,
    farmaciaId: 'f1',
  },
  {
    id: '2',
    codigo: 'COD-002',
    descripcion: 'Ibuprofeno 400mg',
    principioActivo: 'Ibuprofeno',
    presentacion: 'Caja 30 tab',
    marca: 'Cofasa',
    precio: 6.0,
    existencia: 30,
    farmaciaId: 'f1',
  },
  {
    id: '3',
    codigo: 'COD-003',
    descripcion: 'Vitamina C 1g',
    principioActivo: 'Ácido ascórbico',
    presentacion: 'Frasco 30 tab',
    marca: 'Genven',
    precio: 8.0,
    descuentoPorcentaje: 20,
    precioConPorcentaje: 6.4,
    existencia: 20,
    farmaciaId: 'f1',
  },
]

function calcularPrecioConDescuento(producto: Producto, descuentoPorcentaje: number) {
  const porcentaje = Math.max(0, Math.min(100, descuentoPorcentaje))
  const precioCon = Number((producto.precio * (1 - porcentaje / 100)).toFixed(2))
  return { porcentaje, precioCon }
}

export default function FarmaciaInventario() {
  const [file, setFile] = useState<File | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [descuentoGlobal, setDescuentoGlobal] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadInventario() {
      try {
        setCargando(true)
        setMensaje(null)
        const data = await farmaciaApi.inventario()
        if (!cancelled) {
          setProductos(
            data.map((p) => ({
              ...p,
            }))
          )
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setMensaje('No se pudo cargar el inventario desde el backend. Mostrando datos de prueba.')
          setProductos(MOCK_INVENTARIO)
        }
      } finally {
        if (!cancelled) setCargando(false)
      }
    }
    loadInventario()
    return () => {
      cancelled = true
    }
  }, [])

  const productosFiltrados = productos.filter(
    (p) =>
      !busqueda.trim() ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  function aplicarDescuentoProducto(id: string, valor: string) {
    const num = Number(valor)
    if (Number.isNaN(num)) return
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const { porcentaje, precioCon } = calcularPrecioConDescuento(p, num)
        return { ...p, descuentoPorcentaje: porcentaje, precioConPorcentaje: precioCon }
      })
    )
  }

  function aplicarDescuentoMasivo() {
    const num = Number(descuentoGlobal)
    if (Number.isNaN(num)) return
    setProductos((prev) =>
      prev.map((p) => {
        const { porcentaje, precioCon } = calcularPrecioConDescuento(p, num)
        return { ...p, descuentoPorcentaje: porcentaje, precioConPorcentaje: precioCon }
      })
    )
    setMensaje('Descuento masivo aplicado en pantalla. Recuerda guardar para enviar al backend.')
  }

  async function handleGuardar() {
    setGuardando(true)
    setMensaje(null)
    try {
      const payload = productos.map((p) => ({
        id: p.id,
        descuentoPorcentaje: p.descuentoPorcentaje ?? 0,
      }))
      const res = await farmaciaApi.actualizarDescuentos(payload)
      if (res?.ok) {
        setMensaje('Descuentos guardados correctamente en el backend.')
      } else {
        setMensaje(res?.message || 'No se pudo confirmar el guardado de los descuentos.')
      }
    } catch (_) {
      setMensaje('Hubo un error al guardar los descuentos.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="container">
      <h2>Inventario</h2>
      <p className="muted">
        Carga tu inventario por Excel. Columnas: codigo, descripcion, marca, precio, existencia
      </p>

      <div className="card form-group">
        <label>Archivo Excel</label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="button" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={!file}>
          Subir inventario
        </button>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Descuentos</h3>
        <div className="form-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '0 0 220px' }}>
            <label>Descuento masivo (%) para todos los productos</label>
            <input
              type="number"
              min={0}
              max={100}
              value={descuentoGlobal}
              onChange={(e) => setDescuentoGlobal(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-secondary" onClick={aplicarDescuentoMasivo}>
            Aplicar a todos
          </button>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Buscar producto por código o descripción</label>
          <input
            type="search"
            placeholder="Buscar en inventario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Existencia</th>
                <th>Precio base ($)</th>
                <th>Descuento (%)</th>
                <th>Precio con descuento ($)</th>
              </tr>
            </thead>
            <tbody>
              {cargando && productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    Cargando inventario...
                  </td>
                </tr>
              )}
              {productosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.codigo}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.existencia ?? '-'}</td>
                  <td>{p.precio.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={p.descuentoPorcentaje ?? ''}
                      onChange={(e) => aplicarDescuentoProducto(p.id, e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </td>
                  <td>{(p.precioConPorcentaje ?? p.precio).toFixed(2)}</td>
                </tr>
              ))}
              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No hay productos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {mensaje && <span className="muted">{mensaje}</span>}
          <button type="button" className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
