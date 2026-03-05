import { useState, useEffect } from 'react'
import { masterApi, type UsuarioMaster } from '../../api'
import './AdminUsuarios.css'

const ROL_LABEL: Record<string, string> = {
  cliente: 'Cliente',
  farmacia: 'Farmacia',
  delivery: 'Delivery',
  master: 'Admin',
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioMaster[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    masterApi.usuarios()
      .then(setUsuarios)
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="usr-m-loading">Cargando usuarios...</p>

  return (
    <div className="usuarios-master">
      <h2>Usuarios registrados (aprobados)</h2>
      <p className="usr-m-hint">
        Todos los usuarios con cuenta activa: clientes, farmacias y repartidores aprobados.
      </p>
      {usuarios.length === 0 ? (
        <p className="usr-m-empty">No hay usuarios.</p>
      ) : (
        <ul className="usr-m-list">
          {usuarios.map((u) => (
            <li key={u._id} className="usr-m-item card">
              <span className="usr-m-email">{u.email}</span>
              <span className="usr-m-role">{ROL_LABEL[u.role] ?? u.role}</span>
              {u.nombre && <span>{u.nombre}</span>}
              {u.farmaciaId?.nombreFarmacia && <span>— {u.farmaciaId.nombreFarmacia}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
