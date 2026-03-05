import { useState, useEffect, useMemo } from 'react'
import { masterApi, type UsuarioMaster } from '../../api'
import './AdminUsuarios.css'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    masterApi.usuarios()
      .then(setUsuarios)
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false))
  }, [])

  const clientes = useMemo(
    () => usuarios.filter((u) => (u.role || '').toLowerCase() === 'cliente'),
    [usuarios],
  )

  const clientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter((c) => {
      const nombre = (c.nombre || '').toLowerCase()
      const apellido = (c.apellido || '').toLowerCase()
      const email = (c.email || '').toLowerCase()
      const direccion = (c.direccion || '').toLowerCase()
      const telefono = (c.telefono || '').toLowerCase()
      return (
        nombre.includes(q) ||
        apellido.includes(q) ||
        email.includes(q) ||
        direccion.includes(q) ||
        telefono.includes(q)
      )
    })
  }, [clientes, busqueda])

  if (loading) return <p className="usr-m-loading">Cargando clientes...</p>

  return (
    <div className="usuarios-master">
      <h2>Clientes registrados</h2>
      <p className="usr-m-hint">
        Todos los clientes con cuenta activa en la plataforma.
      </p>

      <div className="usr-m-toolbar">
        <input
          type="text"
          className="usr-m-search"
          placeholder="Buscar por nombre, apellido, correo, dirección o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <span className="usr-m-total">
          Total de clientes: <strong>{clientes.length}</strong>
        </span>
      </div>

      {clientesFiltrados.length === 0 ? (
        <p className="usr-m-empty">No se encontraron clientes para los filtros aplicados.</p>
      ) : (
        <ul className="usr-m-list">
          {clientesFiltrados.map((c) => (
            <li key={c._id} className="usr-m-item card">
              <div className="usr-m-main">
                <span className="usr-m-nombre">
                  {(c.nombre || '') + (c.apellido ? ` ${c.apellido}` : '') || 'Sin nombre'}
                </span>
                <span className="usr-m-email">{c.email}</span>
              </div>
              <div className="usr-m-extra">
                {c.direccion && <span className="usr-m-direccion">{c.direccion}</span>}
                {c.telefono && <span className="usr-m-telefono">{c.telefono}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
