import { useEffect, useState } from 'react'
import {
  proveedoresApi,
  type ProveedorApi,
  type ProveedorBody,
} from '../../api'
import './FarmaciaProveedores.css'

type TabProveedores = 'crud' | 'lista-precio'

const INIT_FORM: ProveedorBody = {
  rif: '',
  nombreProveedor: '',
  telefono: '',
  nombreAsesorVentas: '',
  direccion: '',
  condicionesComercialesPct: undefined,
  prontoPagoPct: undefined,
}

export default function FarmaciaProveedores() {
  const [tab, setTab] = useState<TabProveedores>('crud')
  const [proveedores, setProveedores] = useState<ProveedorApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProveedorBody>(INIT_FORM)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // Lista de precios
  const [proveedorSelect, setProveedorSelect] = useState('')
  const [fileLista, setFileLista] = useState<File | null>(null)
  const [subiendoLista, setSubiendoLista] = useState(false)

  function loadProveedores() {
    setLoading(true)
    setError(null)
    proveedoresApi
      .listar()
      .then(setProveedores)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Error al cargar proveedores')
        setProveedores([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProveedores()
  }, [])

  function openEdit(p: ProveedorApi) {
    setEditingId(p.id)
    setForm({
      rif: p.rif || '',
      nombreProveedor: p.nombreProveedor || '',
      telefono: p.telefono ?? '',
      nombreAsesorVentas: p.nombreAsesorVentas ?? '',
      direccion: p.direccion ?? '',
      condicionesComercialesPct: p.condicionesComercialesPct,
      prontoPagoPct: p.prontoPagoPct,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(INIT_FORM)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.rif?.trim() || !form.nombreProveedor?.trim()) {
      setMensaje('RIF y nombre del proveedor son obligatorios.')
      return
    }
    setGuardando(true)
    setMensaje(null)
    try {
      if (editingId) {
        await proveedoresApi.actualizar(editingId, form)
        setMensaje('Proveedor actualizado.')
      } else {
        await proveedoresApi.crear(form)
        setMensaje('Proveedor creado.')
      }
      cancelEdit()
      loadProveedores()
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id: string) {
    if (!window.confirm('¿Eliminar este proveedor?')) return
    try {
      await proveedoresApi.eliminar(id)
      setMensaje('Proveedor eliminado.')
      if (editingId === id) cancelEdit()
      loadProveedores()
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  async function handleSubirListaPrecio() {
    if (!proveedorSelect || !fileLista) {
      setMensaje('Elige un proveedor y un archivo Excel.')
      return
    }
    setSubiendoLista(true)
    setMensaje(null)
    try {
      await proveedoresApi.listaPrecio(proveedorSelect, fileLista)
      setMensaje('Lista de precios subida correctamente.')
      setFileLista(null)
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'Error al subir lista')
    } finally {
      setSubiendoLista(false)
    }
  }

  const tabs: { id: TabProveedores; label: string }[] = [
    { id: 'crud', label: 'Proveedores' },
    { id: 'lista-precio', label: 'Lista de precios (Excel)' },
  ]

  return (
    <div className="container farmacia-proveedores">
      <h2>Proveedores (Plan Full)</h2>
      <p className="muted">CRUD de proveedores, carga de listas de precios por Excel y vista comparativa por mejor precio.</p>

      <div className="pro-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mensaje && (
        <p className={`farmacia-proveedores-msg ${error ? 'error' : ''}`} role="status">
          {mensaje}
        </p>
      )}

      {tab === 'crud' && (
        <>
          <div className="card farmacia-proveedores-form">
            <h3>{editingId ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>RIF *</label>
                  <input
                    value={form.rif}
                    onChange={(e) => setForm((f) => ({ ...f, rif: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group flex-grow">
                  <label>Nombre proveedor *</label>
                  <input
                    value={form.nombreProveedor}
                    onChange={(e) => setForm((f) => ({ ...f, nombreProveedor: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    value={form.telefono ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  />
                </div>
                <div className="form-group flex-grow">
                  <label>Asesor de ventas</label>
                  <input
                    value={form.nombreAsesorVentas ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, nombreAsesorVentas: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  value={form.direccion ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Condiciones comerciales (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.condicionesComercialesPct ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        condicionesComercialesPct: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Pronto pago (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.prontoPagoPct ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        prontoPagoPct: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <h3>Listado</h3>
            {loading ? (
              <p className="muted">Cargando proveedores...</p>
            ) : proveedores.length === 0 ? (
              <p className="muted">No hay proveedores. Crea uno desde el formulario.</p>
            ) : (
              <ul className="farmacia-proveedores-list">
                {proveedores.map((p) => (
                  <li key={p.id} className="farmacia-proveedores-item">
                    <div>
                      <strong>{p.nombreProveedor}</strong> — {p.rif}
                      {p.telefono && <span className="muted"> · {p.telefono}</span>}
                    </div>
                    <div className="farmacia-proveedores-item-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleEliminar(p.id)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {tab === 'lista-precio' && (
        <div className="card">
          <h3>Cargar lista de precios (Excel)</h3>
          <p className="muted">Columnas: codigo, descripcion, marca, precio, existencia. Elige el proveedor y el archivo.</p>
          <div className="form-group">
            <label>Proveedor</label>
            <select
              value={proveedorSelect}
              onChange={(e) => setProveedorSelect(e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreProveedor}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Archivo Excel</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFileLista(e.target.files?.[0] ?? null)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!proveedorSelect || !fileLista || subiendoLista}
            onClick={handleSubirListaPrecio}
          >
            {subiendoLista ? 'Subiendo...' : 'Subir lista'}
          </button>
        </div>
      )}

      {/* La lista comparativa de precios ahora vive solo en Plan Pro → pestaña \"Lista comparativa\" */}
    </div>
  )
}
