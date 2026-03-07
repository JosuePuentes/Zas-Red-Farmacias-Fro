import { useState, useMemo } from 'react'
// Tipos para lista comparativa (proveedor + lista de precios)
interface ItemListaPrecio {
  id: string
  codigo: string
  descripcion: string
  marca: string
  precio: number
  existencia: number
  categoria: string
  proveedorId: string
  proveedorNombre: string
  prioridad?: boolean
}

interface CarritoItemPro {
  item: ItemListaPrecio
  cantidad: number
}

interface ProveedorResumen {
  id: string
  nombre: string
  totalComprado: number
}

// Mock: listas de varios proveedores (backend traerá listas cargadas por la farmacia)
const MOCK_LISTA: ItemListaPrecio[] = [
  { id: '1', codigo: 'A01', descripcion: 'Loratadina 10mg x 10', marca: 'Genven', precio: 2.5, existencia: 100, categoria: 'Antialérgico', proveedorId: 'p1', proveedorNombre: 'Distribuidora Norte', prioridad: true },
  { id: '2', codigo: 'A02', descripcion: 'Amoxicilina 500mg x 21', marca: 'Leti', precio: 4.2, existencia: 50, categoria: 'Antibiótico', proveedorId: 'p1', proveedorNombre: 'Distribuidora Norte', prioridad: true },
  { id: '3', codigo: 'A03', descripcion: 'Paracetamol 500mg x 20', marca: 'Cofasa', precio: 1.8, existencia: 200, categoria: 'Analgésico', proveedorId: 'p2', proveedorNombre: 'FarmaSur' },
  { id: '4', codigo: 'A04', descripcion: 'Loratadina 10mg x 10', marca: 'Cofasa', precio: 2.2, existencia: 80, categoria: 'Antialérgico', proveedorId: 'p2', proveedorNombre: 'FarmaSur', prioridad: true },
  { id: '5', codigo: 'A05', descripcion: 'Azitromicina 500mg x 3', marca: 'Genven', precio: 5.5, existencia: 40, categoria: 'Antibiótico', proveedorId: 'p2', proveedorNombre: 'FarmaSur', prioridad: true },
]

const MOCK_PROVEEDORES: ProveedorResumen[] = [
  { id: 'p1', nombre: 'Distribuidora Norte', totalComprado: 1250.5 },
  { id: 'p2', nombre: 'FarmaSur', totalComprado: 890 },
]

type TabPro = 'lista' | 'carrito' | 'ordenes' | 'proveedores'

export default function FarmaciaPlanPro() {
  const [tab, setTab] = useState<TabPro>('lista')
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState<CarritoItemPro[]>([])
  const [ordenes, setOrdenes] = useState<{ id: string; proveedorNombre: string; fecha: string; total: number; items: CarritoItemPro[] }[]>([])

  const listaFiltrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return MOCK_LISTA
    return MOCK_LISTA.filter(
      (i) =>
        i.codigo.toLowerCase().includes(q) ||
        i.descripcion.toLowerCase().includes(q) ||
        i.marca.toLowerCase().includes(q) ||
        i.categoria.toLowerCase().includes(q)
    )
  }, [busqueda])

  function agregarAlCarrito(item: ItemListaPrecio, cantidad: number) {
    if (cantidad < 1) return
    setCarrito((prev) => {
      const exist = prev.find((c) => c.item.id === item.id && c.item.proveedorId === item.proveedorId)
      if (exist) {
        return prev.map((c) => (c === exist ? { ...c, cantidad: c.cantidad + cantidad } : c))
      }
      return [...prev, { item, cantidad }]
    })
  }

  function quitarDelCarrito(item: CarritoItemPro) {
    setCarrito((prev) => prev.filter((c) => c !== item))
  }

  function generarOrdenesDeCompra() {
    const porProveedor = new Map<string, CarritoItemPro[]>()
    carrito.forEach((c) => {
      const key = c.item.proveedorId
      if (!porProveedor.has(key)) porProveedor.set(key, [])
      porProveedor.get(key)!.push(c)
    })
    const nuevas: { id: string; proveedorNombre: string; fecha: string; total: number; items: CarritoItemPro[] }[] = []
    porProveedor.forEach((items, proveedorId) => {
      const prov = MOCK_PROVEEDORES.find((p) => p.id === proveedorId)
      const total = items.reduce((s, i) => s + i.item.precio * i.cantidad, 0)
      nuevas.push({
        id: `oc-${Date.now()}-${proveedorId}`,
        proveedorNombre: prov?.nombre || proveedorId,
        fecha: new Date().toLocaleDateString(),
        total,
        items,
      })
    })
    setOrdenes((prev) => [...nuevas, ...prev])
    setCarrito([])
  }

  function exportarExcel(orden: { proveedorNombre: string; fecha: string; total: number; items: CarritoItemPro[] }) {
    // Placeholder: en backend se generará el Excel
    const filas = orden.items.map((i) => `${i.item.codigo}\t${i.item.descripcion}\t${i.cantidad}\t${i.item.precio}\t${i.item.precio * i.cantidad}`).join('\n')
    const csv = `Proveedor: ${orden.proveedorNombre}\nFecha: ${orden.fecha}\n\nCódigo\tDescripción\tCantidad\tP.Unit\tTotal\n${filas}\n\nTotal: ${orden.total}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orden-${orden.proveedorNombre.replace(/\s/g, '-')}-${orden.fecha.replace(/\//g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportarPdf(_orden: { proveedorNombre: string; fecha: string; total: number; items: CarritoItemPro[] }) {
    window.print()
  }

  const tabs: { id: TabPro; label: string }[] = [
    { id: 'lista', label: 'Lista comparativa' },
    { id: 'carrito', label: `Carrito (${carrito.length})` },
    { id: 'ordenes', label: 'Órdenes de compra' },
    { id: 'proveedores', label: 'Proveedores' },
  ]

  return (
    <div className="container">
      <h2>Plan Pro</h2>
      <p className="muted">Lista comparativa, carrito, órdenes de compra por proveedor y alertas de inventario y precio.</p>

      <div className="pro-tabs">
        {tabs.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'lista' && (
        <div className="card">
          <h3>Lista comparativa de precios</h3>
          <p className="muted">Registra las listas de tus proveedores; el sistema compara y muestra el mejor precio. Los productos en amarillo son prioridad (inventario bajo o alta demanda).</p>
          <div className="form-group">
            <input
              type="search"
              className="search-input"
              placeholder="Buscar por código, descripción, marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="lista-comparativa-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Existencia</th>
                  <th>Cantidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((item) => (
                  <tr key={item.id} className={item.prioridad ? 'prioridad' : ''}>
                    <td>{item.codigo}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.marca}</td>
                    <td>{item.categoria}</td>
                    <td>$ {item.precio.toFixed(2)}</td>
                    <td>{item.existencia}</td>
                    <td>
                      <CantidadInput item={item} onAgregar={agregarAlCarrito} />
                    </td>
                    <td>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'carrito' && (
        <div className="card">
          <h3>Carrito de compras</h3>
          {carrito.length === 0 ? (
            <p className="muted">Agrega productos desde la Lista comparativa.</p>
          ) : (
            <>
              <ul className="carrito-pro-list">
                {carrito.map((c, idx) => (
                  <li key={idx}>
                    <span>{c.item.descripcion} × {c.cantidad} — $ {(c.item.precio * c.cantidad).toFixed(2)}</span>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => quitarDelCarrito(c)}>Quitar</button>
                  </li>
                ))}
              </ul>
              <p><strong>Total aproximado:</strong> $ {carrito.reduce((s, c) => s + c.item.precio * c.cantidad, 0).toFixed(2)}</p>
              <button type="button" className="btn btn-primary" onClick={generarOrdenesDeCompra}>
                Generar órdenes de compra (por proveedor)
              </button>
            </>
          )}
        </div>
      )}

      {tab === 'ordenes' && (
        <div className="card">
          <h3>Órdenes de compra</h3>
          <p className="muted">Las órdenes se agrupan por proveedor. Las de días anteriores quedan en el historial.</p>
          {ordenes.length === 0 ? (
            <p className="muted">Genera órdenes desde el Carrito.</p>
          ) : (
            ordenes.map((oc) => (
              <div key={oc.id} className="orden-compra-item card">
                <p><strong>{oc.proveedorNombre}</strong> — {oc.fecha} — Total: $ {oc.total.toFixed(2)}</p>
                <ul style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  {oc.items.map((i, j) => (
                    <li key={j}>{i.item.descripcion} × {i.cantidad}</li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportarExcel(oc)}>Exportar Excel</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportarPdf(oc)}>Exportar PDF</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'proveedores' && (
        <div className="card">
          <h3>Nuestros proveedores</h3>
          <p className="muted">Total comprado por proveedor; el sistema usará este historial para sugerir productos en futuras comparativas.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {MOCK_PROVEEDORES.map((p) => (
              <li key={p.id} className="proveedor-row">
                <span>{p.nombre}</span>
                <strong>$ {p.totalComprado.toFixed(2)} comprado</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function CantidadInput({ item, onAgregar }: { item: ItemListaPrecio; onAgregar: (item: ItemListaPrecio, cantidad: number) => void }) {
  const [cant, setCant] = useState(1)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input type="number" min={1} value={cant} onChange={(e) => setCant(Math.max(1, parseInt(e.target.value, 10) || 1))} />
      <button type="button" className="btn btn-primary btn-sm" onClick={() => onAgregar(item, cant)}>Agregar</button>
    </div>
  )
}
