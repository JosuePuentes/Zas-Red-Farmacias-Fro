import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { Producto } from '../../types'
import { farmaciaApi, getApiBaseUrl, type ConflictoDescripcion, type CargarExcelResponse } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { usePlanPro } from '../../context/PlanProContext'
import { STORAGE_FARMACIA_ID } from '../../lib/masterPortalStorage'

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
  const { planProActivo } = usePlanPro()
  const [file, setFile] = useState<File | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [descuentoGlobal, setDescuentoGlobal] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const { user } = useAuth()
  const [farmaciaId, setFarmaciaId] = useState<string | null>(null)
  const [conflictos, setConflictos] = useState<ConflictoDescripcion[] | null>(null)
  /** Por cada codigo, 'catalogo' = usar descripcionSistema, 'farmacia' = usar descripcionArchivo */
  const [decisiones, setDecisiones] = useState<Record<string, 'catalogo' | 'farmacia'>>({})

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

  useEffect(() => {
    // Intentamos resolver farmacia_id desde sesión (master) o desde el usuario autenticado
    const fromStorage = sessionStorage.getItem(STORAGE_FARMACIA_ID)
    if (fromStorage) {
      setFarmaciaId(fromStorage)
      return
    }
    if (user?.id) {
      setFarmaciaId(user.id)
    }
  }, [user])

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

  async function handleSubirInventario() {
    if (!file) return
    if (!farmaciaId) {
      setMensaje('No se encontró el identificador de la farmacia para subir el inventario.')
      return
    }
    setMensaje(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const base = getApiBaseUrl()
      const token = localStorage.getItem('zas_token')
      const res = await fetch(
        `${base}/farmacias/${encodeURIComponent(farmaciaId)}/inventario/cargar-excel`,
        {
          method: 'POST',
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          body: formData,
        },
      )
      const data = await res.json().catch(() => ({})) as CargarExcelResponse

      const conflictosDesc = data.conflictosDescripcion ?? (data as { conflictos_descripcion?: ConflictoDescripcion[] }).conflictos_descripcion
      if (conflictosDesc && Array.isArray(conflictosDesc) && conflictosDesc.length > 0) {
        setConflictos(conflictosDesc)
        setDecisiones({})
        setMensaje('Se detectaron conflictos de descripción. Elige para cada código qué descripción usar y envía la resolución.')
      } else {
        setConflictos(null)
        setDecisiones({})
        const parts: string[] = []
        if (data.creados != null) parts.push(`${data.creados} creados`)
        if (data.actualizados != null) parts.push(`${data.actualizados} actualizados`)
        if (data.vinculadosCatalogo != null) parts.push(`${data.vinculadosCatalogo} vinculados a catálogo`)
        setMensaje(parts.length ? parts.join(', ') + '.' : (data.message || 'Inventario subido correctamente.'))
      }
    } catch (e) {
      console.error('Error al subir inventario', e)
      setMensaje('No se pudo subir el inventario. Intenta nuevamente.')
    }
  }

  function setDecision(codigo: string, usar: 'catalogo' | 'farmacia') {
    setDecisiones((prev) => ({ ...prev, [codigo]: usar }))
  }

  async function handleResolverConflictos() {
    if (!conflictos || conflictos.length === 0) return
    const faltan = conflictos.filter((c) => !decisiones[c.codigo])
    if (faltan.length > 0) {
      setMensaje(`Elige una opción para los códigos: ${faltan.map((c) => c.codigo).join(', ')}`)
      return
    }
    try {
      setMensaje(null)
      const payload = conflictos.map((c) => ({ codigo: c.codigo, usar: decisiones[c.codigo]! }))
      await farmaciaApi.resolverDescripciones(payload)
      setMensaje('Descripciones actualizadas correctamente.')
      setConflictos(null)
      setDecisiones({})
    } catch (e) {
      console.error('Error al resolver conflictos de descripciones', e)
      setMensaje('No se pudieron enviar las decisiones. Intenta nuevamente.')
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
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: '0.5rem' }}
          disabled={!file}
          onClick={handleSubirInventario}
        >
          Subir inventario
        </button>
      </div>

      {conflictos && conflictos.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>Conflictos de descripción</h3>
          <p className="muted">
            Para cada código elige si usar la descripción del sistema (catálogo) o la de tu archivo.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
            {conflictos.map((c) => (
              <li key={c.codigo} style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
                <strong>Para el código {c.codigo}:</strong>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  ¿Usar la descripción del sistema o la de tu archivo?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${decisiones[c.codigo] === 'catalogo' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setDecision(c.codigo, 'catalogo')}
                  >
                    Sistema: &quot;{c.descripcionSistema}&quot;
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${decisiones[c.codigo] === 'farmacia' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setDecision(c.codigo, 'farmacia')}
                  >
                    Archivo: &quot;{c.descripcionArchivo}&quot;
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-primary" onClick={handleResolverConflictos}>
            Enviar resolución
          </button>
        </div>
      )}

      {!planProActivo ? (
        <div className="card plan-pro-blur" style={{ marginTop: '1rem', padding: '2rem', textAlign: 'center' }}>
          <h3>Base de datos de inventario (Plan Pro)</h3>
          <p className="muted">
            La vista completa de todos tus códigos y descripciones, con columnas de <strong>Existencia global</strong> y <strong>Solicitudes</strong>, está disponible con Plan Pro.
          </p>
          <p className="muted">Puedes subir inventario por Excel arriba. Para ver y editar la hoja completa con descuentos y métricas, activa Plan Pro.</p>
          <NavLink to="/farmacia/plan-pro" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            Ver Plan Pro
          </NavLink>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>Base de datos · Descuentos</h3>
          <p className="muted">Toda la base de códigos y descripciones. Con Plan Pro ves Existencia global y Solicitudes.</p>
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
                  {(productosFiltrados.some((p) => p.existenciaGlobal != null)) && <th>Existencia global</th>}
                  {(productosFiltrados.some((p) => p.productosSolicitados != null)) && <th>Solicitudes</th>}
                  <th>Precio base ($)</th>
                  <th>Descuento (%)</th>
                  <th>Precio con descuento ($)</th>
                </tr>
              </thead>
              <tbody>
                {cargando && productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center' }}>
                      Cargando inventario...
                    </td>
                  </tr>
                )}
                {productosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.codigo}</td>
                    <td>{p.descripcion}</td>
                    <td>{p.existencia ?? '-'}</td>
                    {productosFiltrados.some((x) => x.existenciaGlobal != null) && (
                      <td>{typeof p.existenciaGlobal === 'number' ? p.existenciaGlobal : '—'}</td>
                    )}
                    {productosFiltrados.some((x) => x.productosSolicitados != null) && (
                      <td>{typeof p.productosSolicitados === 'number' ? p.productosSolicitados : '—'}</td>
                    )}
                    <td>{typeof p.precio === 'number' ? p.precio.toFixed(2) : '—'}</td>
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
                    <td>{typeof (p.precioConPorcentaje ?? p.precio) === 'number' ? (p.precioConPorcentaje ?? p.precio).toFixed(2) : '—'}</td>
                  </tr>
                ))}
                {!cargando && productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center' }}>
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
      )}
    </div>
  )
}
